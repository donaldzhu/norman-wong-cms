#!/usr/bin/env node
const fs=require('node:fs')
const path=require('node:path')
const {hash,makeManifest,convertDocument}=require('./convert.cjs')
const args=process.argv.slice(2)
const value=key=>{const i=args.indexOf(key);return i<0?undefined:args[i+1]}
const has=key=>args.includes(key)
function clientFor(target) {
  if(!process.env.SANITY_API_TOKEN && !process.env.SANITY_AUTH_TOKEN) throw Error('Set SANITY_API_TOKEN for authenticated reads/writes; never put tokens in arguments.')
  return require('@sanity/client').createClient({...target,apiVersion:'2026-11-05',useCdn:false,perspective:'raw',token:process.env.SANITY_API_TOKEN || process.env.SANITY_AUTH_TOKEN})
}
function save(file,value) {fs.writeFileSync(file,JSON.stringify(value,null,2),{mode:0o600,flag:'wx'})}
const escape=value=>String(value??'').replace(/[|\n\r]/g,' ')
async function main() {
  if(has('--execute') && has('--rollback')) throw Error('Choose execute or rollback, not both.')
  const projectId=value('--project'),dataset=value('--dataset')
  if(!projectId||!dataset) throw Error('Specify --project and --dataset explicitly.')
  const target={projectId,dataset}
  if(has('--execute')||has('--rollback')) {
    const file=value('--manifest'), text=fs.readFileSync(file,'utf8'), manifest=JSON.parse(text)
    if(value('--approve-sha')!==hash(manifest)) throw Error('Manifest approval checksum does not match.')
    if(JSON.stringify(manifest.target)!==JSON.stringify(target)) throw Error('Target differs from manifest.')
    const regenerated=makeManifest(manifest.snapshot,target)
    if(JSON.stringify(regenerated.records)!==JSON.stringify(manifest.records)) throw Error('Manifest proposals do not match deterministic source conversion.')
    const logFile=value('--log');if(!logFile) throw Error('Specify a new --log path.')
    const rollbackLog=has('--rollback')?JSON.parse(fs.readFileSync(value('--from-log'),'utf8')):null
    if(rollbackLog && (rollbackLog.manifestHash!==hash(manifest)||rollbackLog.target.projectId!==projectId||rollbackLog.target.dataset!==dataset)) throw Error('Rollback log target/manifest mismatch.')
    const client=clientFor(target), log={manifestHash:hash(manifest),target,actions:[]}
    save(logFile,log)
    const flush=()=>fs.writeFileSync(logFile,JSON.stringify(log,null,2),{mode:0o600})
    for(const record of manifest.records.filter(r=>r.status==='eligible')) {
      const entry={id:record.id,status:'pending'};log.actions.push(entry);flush()
      try {
        const current=await client.getDocument(record.id)
        const prior=rollbackLog?.actions.find(a=>a.id===record.id && a.status==='verified')
        if(has('--rollback')) {
          if(!prior || current?._rev!==prior.afterRevision) throw Error('No verified unchanged migration revision to roll back.')
          await client.patch(record.id).ifRevisionId(current._rev).unset(Object.keys(record.set)).commit()
          const restored=await client.getDocument(record.id)
          const clean=doc=>{const copy=structuredClone(doc);delete copy._rev;delete copy._updatedAt;return copy}
          require('node:assert/strict').deepEqual(clean(restored),clean(manifest.snapshot.find(d=>d._id===record.id)))
        } else {
          if(hash(current)!==record.sourceHash || current?._rev!==record.revision) throw Error('Source changed; regenerate and review the dry run.')
          entry.beforeRevision=current._rev;flush()
          entry.status='write-attempted';flush()
          const result=await client.patch(record.id).ifRevisionId(record.revision).set(record.set).commit()
          entry.afterRevision=result._rev;entry.status='written';flush()
          const actual=await client.getDocument(record.id)
          const expected=structuredClone(current)
          for(const row of record.slides.filter(s=>s.status==='eligible')) {
            const slide=expected.slides.find(s=>s._key===row.key);slide.layoutV2=row.proposed.layoutV2
            for(const m of row.proposed.media) Object.assign(slide.media.find(s=>s._key===m._key),{desktopSpan:m.desktopSpan,mobileSpan:m.mobileSpan})
          }
          expected._rev=actual._rev;expected._updatedAt=actual._updatedAt
          if(hash(actual)!==hash(expected)) {
            // Object member ordering is not guaranteed by the API.
            require('node:assert/strict').deepEqual(actual,expected)
          }
          if(convertDocument(actual).status!=='already-migrated') throw Error('Post-write layout validation failed')
        }
        entry.status='verified';flush()
      } catch(error) {entry.error=error.message;entry.status=['written','write-attempted'].includes(entry.status)?'reconcile-required':'held';flush();process.exitCode=1}
    }
    console.log(`Run logged to ${logFile}; inspect every held or failed record before resuming.`)
    return
  }
  const out=value('--out');if(!out) throw Error('Specify a fresh private --out directory, e.g. migration-run.local.')
  const documents=has('--fetch')?await clientFor(target).fetch('*[_type == "project" || defined(slides)]'):JSON.parse(fs.readFileSync(value('--input'),'utf8'))
  if(!Array.isArray(documents)) throw Error('Input must be an array of full owning documents, including _id, _type and _rev.')
  fs.mkdirSync(out,{mode:0o700})
  const manifest=makeManifest(documents,target)
  save(path.join(out,'snapshot.json'),documents)
  save(path.join(out,'manifest.json'),manifest)
  const checksum=hash(manifest)
  fs.writeFileSync(path.join(out,'report.md'),`# Layout migration dry run\n\nTarget: ${projectId}/${dataset}\n\nManifest SHA-256: ${checksum}\n\nSummary: ${JSON.stringify(manifest.summary)}\n\n| Project / ID | Variant | Slide | Source desktop → target | Source mobile → target | Mobile interpretation | Status / issues |\n| --- | --- | --- | --- | --- | --- | --- |\n`+manifest.records.flatMap(r=>r.slides.length?r.slides.map(s=>`| ${escape(r.title)} / ${escape(r.id)} | ${r.variant} | ${escape(s.key)} (#${s.index}) | ${escape(JSON.stringify(s.rawDesktop))} → ${escape(JSON.stringify(s.proposed?.media.map(m=>m.desktopSpan)))} (${s.proposed?.layoutV2.desktop.mode??'—'}) | ${escape(JSON.stringify(s.rawMobile))} → ${escape(JSON.stringify(s.proposed?.media.map(m=>m.mobileSpan)))} | ${s.autoReason??'—'} | ${r.status}: ${escape([...r.issues,...s.issues].join('; '))} |`):[`| ${escape(r.title)} / ${escape(r.id)} | — | — | — | — | — | ${r.status}: ${escape(r.issues.join('; '))} |`]).join('\n'),{mode:0o600})
  console.log(JSON.stringify({target,summary:manifest.summary,manifestSha:checksum,out},null,2))
}
if(require.main===module) main().catch(error=>{console.error(error.message);process.exitCode=1})
module.exports={main}
