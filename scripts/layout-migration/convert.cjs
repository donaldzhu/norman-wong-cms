const {createHash} = require('node:crypto')
const DESKTOP = [6,8,10,12,14,16]
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const span = (start,end,limit) => Number.isInteger(start) && Number.isInteger(end) && start >= 1 && end <= limit+1 && end > start ? end-start : undefined
const keysValid = items => items.every(item=>typeof item?._key==='string' && item._key.length) && new Set(items.map(item=>item._key)).size===items.length
function validV2(slide) {
  const v=slide.layoutV2, media=slide.media
  if(!v || v.version!==2 || !Array.isArray(media) || media.length<1 || media.length>4 || !keysValid(media)) return false
  if(!['center','justify'].includes(v.desktop?.mode) || !['center','justify'].includes(v.mobile?.mode) || typeof v.mobile?.auto!=='boolean' || !['portrait','landscape'].includes(v.mobile?.orientation)) return false
  if(!media.every(m=>DESKTOP.includes(m.desktopSpan) && Number.isInteger(m.mobileSpan) && m.mobileSpan>=1 && m.mobileSpan<=11)) return false
  if(v.desktop.mode==='justify' ? media.length!==1 : media.reduce((n,m)=>n+m.desktopSpan,0)>24) return false
  return v.mobile.auto || (v.mobile.mode==='justify' ? media.length===1 : media.reduce((n,m)=>n+m.mobileSpan,0)<=12)
}
function convertSlide(slide,index) {
  const issues=[], media=Array.isArray(slide.media)?slide.media:[]
  const row={key:slide._key,index:index+1,source:structuredClone(slide),issues}
  if(slide.layoutV2!==undefined || media.some(m=>m.desktopSpan!==undefined || m.mobileSpan!==undefined)) {
    return {...row,status:validV2(slide)?'already-migrated':'blocked',issues:validV2(slide)?[]:['Incomplete or invalid existing V2 layout']}
  }
  if(!media.length || media.length>4) issues.push('Media count must be 1–4')
  if(!keysValid(media)) issues.push('Missing or duplicate media keys')
  const rawDesktop=media.map(m=>span(m.desktopStart,m.desktopEnd,24))
  const rawMobile=media.map(m=>span(m.mobileStart,m.mobileEnd,12))
  const desktopJustify=media.length===1 && rawDesktop[0]===24
  const desktopSpans=rawDesktop.map((s,i)=>{
    const mapped=({4:6,7:6,9:8,18:16})[s]??s
    if(desktopJustify) return 16
    if(!DESKTOP.includes(mapped)) issues.push(`Media ${i+1}: unsupported desktop lines/span`)
    return mapped
  })
  if(!desktopJustify && desktopSpans.reduce((n,s)=>n+(s??0),0)>24) issues.push('Normalized desktop total exceeds 24')
  const absent=media.every(m=>m.mobileStart==null && m.mobileEnd==null)
  const preset=({1:8,2:6,3:4,4:3})[media.length]
  const defaults=media.length>0 && rawMobile.every(s=>s!==undefined && s===preset)
  const auto=absent||defaults
  const mobileJustify=auto?desktopJustify:media.length===1 && rawMobile[0]===12
  const mobileSpans=auto?desktopSpans.map(s=>desktopJustify?8:s===undefined?undefined:s/2):rawMobile.map(s=>mobileJustify?8:s)
  if(!auto && rawMobile.some(s=>s===undefined)) issues.push('Missing or invalid custom mobile lines')
  if(!mobileJustify && mobileSpans.reduce((n,s)=>n+(s??0),0)>12) issues.push('Mobile total exceeds 12')
  const orientation=slide.mobileOrientation??'landscape'
  if(!['portrait','landscape'].includes(orientation)) issues.push('Unknown mobile orientation')
  const proposed={layoutV2:{_type:'projectSlideLayoutV2',version:2,desktop:{_type:'projectSlideDesktopLayout',mode:desktopJustify?'justify':'center'},mobile:{_type:'projectSlideMobileLayout',auto,orientation,mode:mobileJustify?'justify':'center'}},media:media.map((m,i)=>({_key:m._key,desktopSpan:desktopSpans[i],mobileSpan:mobileSpans[i]}))}
  return {...row,status:issues.length?'blocked':'eligible',rawDesktop,rawMobile,autoReason:auto?(absent?'all-absent':'old-center-default'):'custom',orientationDefaulted:slide.mobileOrientation==null,proposed}
}
const keyed = key => `[_key==${JSON.stringify(key)}]`
function convertDocument(document) {
  if(document._id?.startsWith('versions.')) return {id:document._id,status:'excluded',issues:['Release/version document requires separate scope decision'],slides:[]}
  if(document._type!=='project') return {id:document._id,status:'excluded',issues:['Non-project owning document requires scope review'],slides:[]}
  const slides=Array.isArray(document.slides)?document.slides:[]
  const rows=slides.map(convertSlide), issues=[]
  if(!document._id || !document._rev) issues.push('Missing document ID/revision')
  if(!slides.length || !keysValid(slides)) issues.push('Missing slides or missing/duplicate slide keys')
  if(rows.some(s=>s.status==='blocked')) issues.push('One or more slides blocked; whole document held')
  const status=issues.length?'blocked':rows.every(s=>s.status==='already-migrated')?'already-migrated':'eligible'
  const set={}
  if(status==='eligible') for(const row of rows.filter(r=>r.status==='eligible')) {
    const base=`slides${keyed(row.key)}`
    set[`${base}.layoutV2`]=row.proposed.layoutV2
    for(const media of row.proposed.media) for(const field of ['desktopSpan','mobileSpan']) set[`${base}.media${keyed(media._key)}.${field}`]=media[field]
  }
  return {id:document._id,revision:document._rev,title:document.title,slug:document.slug?.current,variant:document._id?.startsWith('drafts.')?'draft':'published',status,issues,slides:rows,set,sourceHash:hash(document)}
}
function makeManifest(documents,target) {
  const records=documents.map(convertDocument)
  return {format:1,target,createdAt:new Date().toISOString(),snapshot:documents,records,summary:records.reduce((s,r)=>(s[r.status]=(s[r.status]??0)+1,s),{scanned:records.length})}
}
module.exports={hash,span,validV2,convertSlide,convertDocument,makeManifest}
