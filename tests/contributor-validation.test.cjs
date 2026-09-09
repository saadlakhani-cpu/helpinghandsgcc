const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
function load(file, mocks = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      require: (name) => mocks[name] || require(name),
      URL,
      Buffer,
      process,
      setTimeout,
      clearTimeout,
    },
  );
  return exports;
}
const model = load("lib/contributors/model.ts");
const extractor = load("lib/contributors/extract.ts", {
  "./model": model,
  "@/lib/ingest/categorize": { categorizeJob: () => ({ category: "Finance" }) },
});
test("canonical URLs remove tracking without merging distinct Indeed jobs", () => {
  assert.equal(
    model.canonicalUrl("https://www.linkedin.com/jobs/view/12345/?trk=abc"),
    "https://linkedin.com/jobs/view/12345",
  );
  assert.equal(
    model.canonicalUrl(
      "https://www.linkedin.com/jobs/view/finance-manager-12345",
    ),
    "https://linkedin.com/jobs/view/12345",
  );
  assert.equal(
    model.canonicalUrl("https://indeed.com/viewjob?utm_source=test&jk=aaa"),
    "https://indeed.com/viewjob?jk=aaa",
  );
  assert.notEqual(
    model.canonicalUrl("https://indeed.com/viewjob?jk=aaa"),
    model.canonicalUrl("https://indeed.com/viewjob?jk=bbb"),
  );
  for (const url of [
    "http://localhost/x",
    "http://127.0.0.1/x",
    "https://user:pass@example.com",
    "https://example.com:8443/job",
    "file:///tmp/test",
  ])
    assert.throws(() => model.canonicalUrl(url));
});
test("structured extraction requires real location and posting date", () => {
  const job = {
    "@type": "JobPosting",
    title: "Finance Manager",
    description: "<p>Monthly finance reporting</p>",
    hiringOrganization: { name: "Example" },
    jobLocation: {
      address: { addressLocality: "Riyadh", addressCountry: "SA" },
    },
    datePosted: "2026-09-01",
  };
  const html = (value) =>
    `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
  assert.equal(extractor.extractDetails(html(job), []).country, "KSA");
  assert.throws(() =>
    extractor.extractDetails(html({ ...job, jobLocation: undefined }), []),
  );
  assert.throws(() =>
    extractor.extractDetails(html({ ...job, datePosted: undefined }), []),
  );
  assert.throws(() => extractor.extractDetails(html([job, job]), []));
});
test("private and reserved addresses cannot be fetched", () => {
  for (const ip of [
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "169.254.169.254",
    "192.168.1.1",
    "100.64.0.1",
    "::1",
  ])
    assert.equal(extractor.publicAddress(ip), false);
  assert.equal(extractor.publicAddress("8.8.8.8"), true);
});
