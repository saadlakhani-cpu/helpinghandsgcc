const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { PGlite } = require(
  process.env.SQL_TEST_RUNTIME || "@electric-sql/pglite",
);

test("queue claims, RLS, duplicate reservations, recovery, atomic publishing and earnings", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role;",
    );
    const core = fs.readFileSync(
      "supabase/migrations/20240526000001_create_tables.sql",
      "utf8",
    );
    await db.exec(
      core.slice(
        core.indexOf("CREATE TABLE jobs"),
        core.indexOf("-- TABLE 2:"),
      ),
    );
    await db.exec(
      fs.readFileSync(
        "supabase/migrations/20260909000001_contributor_portal.sql",
        "utf8",
      ),
    );
    await db.exec(
      "insert into contributors(email,name,rate_minor)values('one@example.com','One',250),('two@example.com','Two',500)",
    );
    const submit = async (email, url) =>
      (
        await db.query(
          "select * from submit_contributor_link($1,$2,$2,false)",
          [email, url],
        )
      ).rows[0];
    const a = await submit("one@example.com", "https://example.com/jobs/1");
    const duplicate = await submit(
      "two@example.com",
      "https://example.com/jobs/1",
    );
    assert.equal(a.status, "queued");
    assert.equal(duplicate.status, "duplicate");
    const b = await submit("one@example.com", "https://example.com/jobs/2");
    const claimed = (await db.query("select * from claim_contributor_links(3)"))
      .rows;
    assert.equal(claimed.length, 2);
    assert.equal(
      (await db.query("select * from claim_contributor_links(3)")).rows.length,
      0,
    );
    await db.query(
      "update contributor_submissions set attempts=3,lease_until=now()-interval '1 minute' where id=$1",
      [b.id],
    );
    await db.query("select * from claim_contributor_links(3)");
    assert.equal(
      (
        await db.query(
          "select status from contributor_submissions where id=$1",
          [b.id],
        )
      ).rows[0].status,
      "needs_details",
    );
    const d = {
      title: "Finance Manager",
      company: "Example",
      country: "KSA",
      city: "Riyadh",
      category: "Finance",
      date_posted: "2026-09-01",
      description: "Finance reporting role",
    };
    await db.query(
      "update contributor_submissions set details=$2,status='review' where id=$1",
      [a.id, JSON.stringify(d)],
    );
    const job = {
      slug: "finance-test",
      job_fingerprint: "fingerprint-test",
      platform: "example.com",
    };
    const approve = async (id) =>
      (
        await db.query(
          "select approve_contributor_submission($1,$2) as result",
          [id, JSON.stringify(job)],
        )
      ).rows[0].result;
    assert.equal((await approve(a.id)).status, "approved");
    await approve(a.id);
    assert.equal(
      (await db.query("select count(*)::int as n from jobs")).rows[0].n,
      1,
    );
    assert.equal(
      (
        await db.query(
          "select amount_minor from contributor_submissions where id=$1",
          [a.id],
        )
      ).rows[0].amount_minor,
      250,
    );
    await db.query(
      "update contributor_submissions set details=$2,status='review' where id=$1",
      [b.id, JSON.stringify(d)],
    );
    assert.equal((await approve(b.id)).status, "duplicate");
    assert.equal(
      (
        await db.query(
          "select amount_minor from contributor_submissions where id=$1",
          [b.id],
        )
      ).rows[0].amount_minor,
      0,
    );
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select * from contributors"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from contributor_submissions"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from claim_contributor_links(1)"),
      /permission denied/,
    );
    await db.exec("reset role");
    await db.exec(
      "update contributors set active=false where email='two@example.com'",
    );
    await assert.rejects(
      submit("two@example.com", "https://example.com/jobs/3"),
      /disabled/,
    );
  } finally {
    await db.close();
  }
});
