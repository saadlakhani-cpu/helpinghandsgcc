const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, require: name => mocks[name] || require(name),
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.com', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test' } },
  });
  return exports;
}

test('auth return paths reject external, backslash and privileged destinations', () => {
  const { getSafeReturnPath } = load('lib/auth/return-to.ts');
  for (const path of ['https://evil.example', '//evil.example', '/\\evil.example', '/\t/evil.example', '/admin', '/api/test', '/manual-import']) {
    assert.equal(getSafeReturnPath(path), '/jobs', path);
  }
  assert.equal(getSafeReturnPath('/recruiters?tab=jobs'), '/recruiters?tab=jobs');
  assert.equal(getSafeReturnPath('/cv-review'), '/cv-review');
});

test('recovery can consume tokens explicitly without changing normal auth defaults', () => {
  const options = [];
  const { createBrowserClient } = load('lib/supabase/client.ts', {
    '@supabase/supabase-js': { createClient: (_url, _key, config) => options.push(config) },
  });
  createBrowserClient();
  createBrowserClient(false);
  assert.equal(options[0].auth.detectSessionInUrl, true);
  assert.equal(options[1].auth.detectSessionInUrl, false);
});
