const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, {exports,require:n=>mocks[n]||require(n),process:{env:{ADMIN_SECRET:'test',NEXT_PUBLIC_SUPABASE_URL:'https://example.com',SUPABASE_SERVICE_ROLE_KEY:'test'}},console,...globals});
  return exports;
}
test('short display references keep the database UUID unchanged', () => {
  const {recruiterReference} = load('lib/recruiters/reference.ts');
  assert.equal(recruiterReference('8b4e97e8-9c89-424c-bdd3-2a732e60e87d'), 'JOB-8B4E97E8');
});
test('Supabase server requests explicitly bypass stale caches', async () => {
  let config, request;
  const {createAdminClient} = load('lib/supabase/admin.ts', {'@supabase/supabase-js':{createClient:(_u,_k,c)=>{config=c;}}}, {fetch:async (_u,c)=>{request=c;}});
  createAdminClient();
  await config.global.fetch('https://example.com', {method:'GET',cache:'force-cache'});
  assert.equal(request.cache,'no-store');
  assert.equal(request.method,'GET');
});
test('Approve publishes once, confirms status, and retries reuse the job', async () => {
  const post = {id:'test-job-id',status:'pending_review',title:'Accountant',city:'Riyadh',company:'Example',category:'Finance',country:'KSA',description:'Test',work_type:'On-site',seniority:'Senior',apply_email:'test@example.com'};
  let job, writes=0, failStatus=true;
  const invalidated=[];
  const db={from:table=>{
    let value, op='read';
    const q={select:()=>q,eq:()=>q,upsert:v=>{value=v;op='upsert';return q;},update:v=>{value=v;op='update';return q;},maybeSingle:async()=>({data:job||null}),single:async()=>{
      if(table==='jobs'){assert.equal(op,'upsert');job={...value};writes++;return {data:job};}
      if(op==='update'){if(failStatus)return {error:{message:'test failure'}};Object.assign(post,value);}
      return {data:{...post}};
    }};return q;
  }};
  const route=load('app/api/admin/actions/route.ts',{
    'next/server':{NextResponse:{json:(body,opts={})=>({body,status:opts.status||200})}},
    'next/cache':{revalidatePath:p=>invalidated.push(p)},
    '@/lib/supabase/admin':{createAdminClient:()=>db},
    '@/lib/ingest/fingerprint':{generateJobFingerprint:()=> 'fingerprint'},
    '@/lib/ingest/slug':{generateJobSlug:()=> 'accountant-riyadh-random'},
    '@/lib/ingest/import-job-links':{},
  });
  const request={cookies:{get:()=>({value:'test'})},headers:{get:()=> 'https://example.com'},nextUrl:{origin:'https://example.com'},json:async()=>({action:'approve-recruiter-job',recruiterJobId:post.id})};
  assert.equal((await route.POST(request)).status,500);
  assert.equal(job.id,post.id);
  failStatus=false;
  const approved=await route.POST(request);
  assert.equal(approved.status,200);
  assert.equal(approved.body.status,'published');
  assert.equal(post.published_job_id,job.id);
  assert.equal(job.is_active,true);
  const before=writes;
  assert.equal((await route.POST(request)).status,200);
  assert.equal(writes,before);
  assert.ok(invalidated.includes('/admin'));
  assert.ok(invalidated.includes('/jobs'));
});
