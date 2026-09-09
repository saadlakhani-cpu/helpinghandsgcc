const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => mocks[name] || require(name),
    process: { env: { ADMIN_SECRET: "test-admin-secret" } },
    console,
    Date,
    Object,
    JSON,
  });
  return exports;
}
const validation = load("lib/enquiries.ts");
const valid = {
  type: "individual",
  topic: "AI for Finance Professionals",
  name: "Test Person",
  email: " TEST@example.com ",
  consent: true,
};
const responseMock = {
  NextResponse: {
    json: (body, options = {}) => ({ body, status: options.status || 200 }),
  },
};
function request(body, overrides = {}) {
  return {
    text: async () => JSON.stringify(body),
    json: async () => body,
    nextUrl: { origin: "https://example.com" },
    headers: {
      get: (name) => (name === "origin" ? "https://example.com" : null),
    },
    cookies: { get: () => undefined },
    ...overrides,
  };
}

test("validates each enquiry type and normalises contact details", () => {
  assert.equal(validation.validateEnquiry(valid).email, "test@example.com");
  for (const type of ["corporate", "solution"]) {
    assert.equal(
      validation.validateEnquiry({
        ...valid,
        type,
        topic: validation.enquiryTopics[type][0],
        company: "Example",
      }).type,
      type,
    );
  }
});
test("rejects consent omission, invalid topics, unsafe types and oversized content", () => {
  for (const changes of [
    { consent: false },
    { email: "invalid" },
    { name: 5 },
    { type: "__proto__" },
    { topic: "Other" },
    { message: "a".repeat(3001) },
    { type: "corporate", topic: "Corporate AI Workshops" },
  ]) {
    assert.throws(() => validation.validateEnquiry({ ...valid, ...changes }));
  }
  assert.throws(() => validation.validateEnquiry(null));
});
test("public API only succeeds after persistence; does not expose database errors", async () => {
  let saved;
  let fail = false;
  const route = load("app/api/enquiries/route.ts", {
    "next/server": responseMock,
    "@/lib/enquiries": validation,
    "@/lib/security/rate-limit": { checkRateLimit: () => ({ limited: false }) },
    "@/lib/supabase/admin": {
      createAdminClient: () => ({
        from: () => ({
          insert: async (row) => {
            saved = row;
            return {
              error: fail ? { message: "private database detail" } : null,
            };
          },
        }),
      }),
    },
  });
  assert.equal((await route.POST(request(valid))).status, 201);
  assert.equal(saved.email, "test@example.com");
  fail = true;
  const failed = await route.POST(request(valid));
  assert.equal(failed.status, 503);
  assert.ok(!failed.body.error.includes("private database detail"));
  assert.equal((await route.POST(request(null))).status, 400);
  assert.equal(
    (
      await route.POST(
        request(valid, { headers: { get: () => "https://other.example" } }),
      )
    ).status,
    403,
  );
});
test("public API rate limits before database access", async () => {
  const route = load("app/api/enquiries/route.ts", {
    "next/server": responseMock,
    "@/lib/enquiries": validation,
    "@/lib/security/rate-limit": {
      checkRateLimit: () => ({ limited: true, retryAfter: 60 }),
    },
    "@/lib/supabase/admin": {
      createAdminClient: () => {
        throw new Error("Database must not be called");
      },
    },
  });
  assert.equal((await route.POST(request(valid))).status, 429);
});
test("admin updates require session, same origin, valid status and an existing record", async () => {
  let found = true;
  const route = load("app/api/admin/enquiries/route.ts", {
    "next/server": responseMock,
    "@/lib/enquiries": validation,
    "@/lib/supabase/admin": {
      createAdminClient: () => ({
        from: () => ({
          update: () => ({
            eq: () => ({
              select: () => ({
                maybeSingle: async () => ({
                  data: found ? { id: "test" } : null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    },
  });
  const body = {
    id: "11111111-1111-4111-8111-111111111111",
    status: "Contacted",
  };
  assert.equal((await route.PATCH(request(body))).status, 401);
  const session = { cookies: { get: () => ({ value: "test-admin-secret" }) } };
  assert.equal((await route.PATCH(request(body, session))).status, 200);
  assert.equal(
    (await route.PATCH(request({ ...body, status: "Published" }, session)))
      .status,
    400,
  );
  assert.equal(
    (
      await route.PATCH(
        request(body, {
          ...session,
          headers: { get: () => "https://other.example" },
        }),
      )
    ).status,
    403,
  );
  found = false;
  assert.equal((await route.PATCH(request(body, session))).status, 404);
});
