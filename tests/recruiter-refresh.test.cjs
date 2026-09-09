const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => mocks[name] || require(name), console, ...globals });
  return exports;
}

test('two jobs from one recruiter are both saved and receive distinct references', async () => {
  const jobs = [];
  const route = load('app/api/recruiters/submit/route.ts', {
    'next/server': { NextResponse: { json: (body, opts = {}) => ({ body, status: opts.status || 200 }) } },
    '@/lib/security/rate-limit': { checkRateLimit: () => ({ limited: false }) },
    '@/lib/supabase/admin': { createAdminClient: () => ({
      auth: { getUser: async () => ({ data: { user: { id: 'recruiter-one', email: 'test@example.com' } } }) },
      from: table => table === 'recruiter_profiles' ? {
        upsert: () => ({ select: () => ({ single: async () => ({ data: { id: 'profile-one' } }) }) }),
      } : {
        insert: job => { jobs.push(job); return { select: () => ({ single: async () => ({ data: { id: `job-${jobs.length}`, status: 'pending_review' } }) }) }; },
      },
    }) },
  });
  const payload = { company_name: 'Example', contact_name: 'Test', work_email: 'test@example.com', country: 'KSA', hiring_categories: ['Finance'], category: 'Finance', job_country: 'KSA', city: 'Riyadh', work_type: 'On-site', seniority: 'Senior', description: 'Test role' };
  const send = title => route.POST({ headers: { get: name => name === 'authorization' ? 'Bearer test-token' : null }, json: async () => ({ ...payload, title }) });
  const first = await send('Accountant');
  const second = await send('Finance Manager');
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(jobs.length, 2);
  assert.equal(jobs[0].recruiter_profile_id, jobs[1].recruiter_profile_id);
  assert.notEqual(first.body.job_post.id, second.body.job_post.id);
});

test('admin refreshes on interval and focus, pauses when hidden, and cleans up listeners', () => {
  let refreshes = 0;
  let interval;
  let cleanup;
  const listeners = {};
  const doc = { visibilityState: 'visible', addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener: name => { delete listeners[name]; } };
  const component = load('app/admin/_components/AdminRefresh.tsx', {
    react: { useCallback: fn => fn, useTransition: () => [false, fn => fn()], useEffect: fn => { cleanup = fn(); } },
    'next/navigation': { useRouter: () => ({ refresh: () => refreshes++ }) },
  }, {
    document: doc,
    window: { setInterval: (fn, ms) => { assert.equal(ms, 30000); interval = fn; return 1; }, clearInterval: () => { interval = null; }, addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener: name => { delete listeners[name]; } },
  });
  component.AdminRefresh();
  interval();
  assert.equal(refreshes, 1);
  doc.visibilityState = 'hidden';
  interval();
  assert.equal(refreshes, 1);
  doc.visibilityState = 'visible';
  listeners.focus();
  assert.equal(refreshes, 2);
  cleanup();
  assert.equal(interval, null);
  assert.equal(Object.keys(listeners).length, 0);
});
