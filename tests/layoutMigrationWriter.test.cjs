const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),Module=require('node:module')
const {makeManifest,hash}=require('../scripts/layout-migration/convert.cjs')
test('writer refuses drift, verifies writes, skips reruns, and guards rollback',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'layout-writer-'))
 const original={_id:'p',_type:'project',_rev:'r',_updatedAt:'before',slides:[{_key:'s',media:[{_key:'m',desktopStart:1,desktopEnd:10}]}]}
 let current=structuredClone(original),writes=0
 const client={getDocument:async()=>structuredClone(current),patch:()=>{
  let revision,values,remove
  const patch={ifRevisionId:r=>(revision=r,patch),set:v=>(values=v,patch),unset:v=>(remove=v,patch),commit:async()=>{
   assert.equal(current._rev,revision)
   const locate=p=>{const match=p.match(/^slides\[_key==(".*?")\](?:\.media\[_key==(".*?")\])?\.(\w+)$/);assert.ok(match);let parent=current.slides.find(s=>s._key===JSON.parse(match[1]));if(match[2]) parent=parent.media.find(m=>m._key===JSON.parse(match[2]));return [parent,match[3]]}
   for(const [p,value] of Object.entries(values??{})) {const [parent,key]=locate(p);parent[key]=value}
   for(const p of remove??[]) {const [parent,key]=locate(p);delete parent[key]}
   writes++;current._rev=`r${writes}`;current._updatedAt='after';return structuredClone(current)
  }};return patch
 }}
 const target={projectId:'fixture',dataset:'test'},manifest=makeManifest([original],target),file=path.join(dir,'manifest.json')
 fs.writeFileSync(file,JSON.stringify(manifest))
 const oldLoad=Module._load,oldArgs=process.argv,oldToken=process.env.SANITY_API_TOKEN,oldExit=process.exitCode
 Module._load=function(id,...rest){return id==='@sanity/client'?{createClient:()=>client}:oldLoad.call(this,id,...rest)}
 process.env.SANITY_API_TOKEN='fixture-only'
 async function run(extra){process.argv=['node','run','--project','fixture','--dataset','test','--manifest',file,'--approve-sha',hash(manifest),...extra];delete require.cache[require.resolve('../scripts/layout-migration/run.cjs')];await require('../scripts/layout-migration/run.cjs').main()}
 try {
  current._rev='changed';await run(['--execute','--log',path.join(dir,'conflict.json')]);assert.equal(writes,0)
  current=structuredClone(original);const log=path.join(dir,'write.json');await run(['--execute','--log',log]);assert.equal(writes,1);assert.equal(JSON.parse(fs.readFileSync(log)).actions[0].status,'verified')
  await run(['--execute','--log',path.join(dir,'repeat.json')]);assert.equal(writes,1)
  current._rev='editor-change';await run(['--rollback','--from-log',log,'--log',path.join(dir,'rollback-conflict.json')]);assert.equal(writes,1)
  current._rev='r1';await run(['--rollback','--from-log',log,'--log',path.join(dir,'rollback.json')]);assert.equal(writes,2);assert.equal(current.slides[0].layoutV2,undefined);assert.equal(current.slides[0].media[0].desktopEnd,10)
  const altered=structuredClone(manifest);altered.records[0].set={bad:true};fs.writeFileSync(file,JSON.stringify(altered));await assert.rejects(()=>run(['--execute','--log',path.join(dir,'tamper.json')]),/checksum/)
 } finally {Module._load=oldLoad;process.argv=oldArgs;if(oldToken===undefined)delete process.env.SANITY_API_TOKEN;else process.env.SANITY_API_TOKEN=oldToken;process.exitCode=oldExit;fs.rmSync(dir,{recursive:true,force:true})}
})
