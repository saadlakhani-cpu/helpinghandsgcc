const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, Date });
  return exports;
}
const { trainingTracks, findTrainingTrack } = load('lib/training.ts');
const { validateEnquiry } = load('lib/enquiries.ts');
test('four unique training pages have images and valid individual/corporate topics', () => {
  assert.deepEqual(Array.from(trainingTracks, t => t.slug), ['finance', 'supply-chain', 'hr', 'sales']);
  for (const track of trainingTracks) {
    assert.ok(fs.existsSync(`public/images/services/${track.image}.webp`));
    assert.equal(findTrainingTrack(track.slug).title, track.title);
    for (const type of ['individual', 'corporate']) {
      const saved = validateEnquiry({ type, topic: track.topic, name: 'Test Person', email: 'test@example.com', company: 'Example', consent: true });
      assert.equal(saved.topic, track.topic);
      assert.equal(saved.type, type);
    }
  }
  assert.equal(findTrainingTrack('unknown'), undefined);
});
test('legacy training enquiry links remain valid', () => {
  for (const [type, topic] of [['individual', 'AI Productivity at Work'], ['corporate', 'Corporate AI Workshops']]) {
    assert.equal(validateEnquiry({ type, topic, name: 'Test Person', email: 'test@example.com', company: 'Example', consent: true }).topic, topic);
  }
});
