const {test}=require('node:test')
const assert=require('node:assert/strict')
const {convertDocument,convertSlide,validV2,makeManifest,hash}=require('../scripts/layout-migration/convert.cjs')
const media=(span,mobile,key='m')=>({_key:key,desktopStart:1,desktopEnd:1+span,...(mobile===undefined?{}:{mobileStart:1,mobileEnd:1+mobile}),mediaType:'image',image:{asset:{_ref:'unchanged'}}})
const slide=(items)=>({_key:'s',media:items,mobileOrientation:'portrait'})
const doc=s=>({_id:'p',_type:'project',_rev:'r',slides:[s]})
test('agreed desktop mapping without source mutation',()=>{
 for(const [old,value] of [[4,6],[6,6],[7,6],[8,8],[9,8],[10,10],[12,12],[14,14],[16,16],[18,16]]) {
  const source=slide([media(old)]),before=structuredClone(source),r=convertSlide(source,0)
  assert.equal(r.status,'eligible');assert.equal(r.proposed.media[0].desktopSpan,value);assert.deepEqual(source,before)
 }
 const r=convertSlide(slide([media(24)]),0)
 assert.equal(r.proposed.layoutV2.desktop.mode,'justify');assert.equal(r.proposed.media[0].desktopSpan,16)
})
test('Auto inferred before changes; custom 10 and full 12 preserved',()=>{
 for(let count=1;count<=4;count++) {
  const r=convertSlide(slide(Array.from({length:count},(_,i)=>media(6,[0,8,6,4,3][count],String(i)))),0)
  assert.equal(r.proposed.layoutV2.mobile.auto,true)
  assert.ok(r.proposed.media.every(m=>m.mobileSpan===3))
 }
 for(const span of [4,6,10]) {const r=convertSlide(slide([media(9,span)]),0);assert.equal(r.proposed.layoutV2.mobile.auto,false);assert.equal(r.proposed.media[0].mobileSpan,span)}
 assert.equal(convertSlide(slide([media(8,12)]),0).proposed.layoutV2.mobile.mode,'justify')
})
test('holds overages, malformed lines, partial fields and whole documents',()=>{
 for(const items of [[media(24,4),media(6,4,'b')],[media(14,4),media(12,4,'b')],[media(8,10),media(8,4,'b')],[{...media(8),mobileStart:1}],[media(5)]]) assert.equal(convertDocument(doc(slide(items))).status,'blocked')
 const d=doc(slide([media(8)]));d.slides.push({...slide([media(5)]),_key:'bad'});assert.deepEqual(convertDocument(d).set,{})
 assert.equal(convertSlide(slide([media(8),media(8)]),0).status,'blocked')
})
test('V2 validates, reruns skip and partial new fields block',()=>{
 const s=slide([media(9,10)]),r=convertSlide(s,0)
 s.layoutV2=r.proposed.layoutV2;Object.assign(s.media[0],r.proposed.media[0])
 assert.equal(validV2(s),true);assert.equal(convertDocument(doc(s)).status,'already-migrated')
 delete s.layoutV2;assert.equal(convertSlide(s,0).status,'blocked')
})
test('keyed patches preserve variants and avoid legacy fields',()=>{
 const d=doc(slide([media(9)])),r=convertDocument(d)
 assert.deepEqual(Object.keys(r.set),['slides[_key=="s"].layoutV2','slides[_key=="s"].media[_key=="m"].desktopSpan','slides[_key=="s"].media[_key=="m"].mobileSpan'])
 const draft={...d,_id:'drafts.p'};assert.equal(convertDocument(draft).variant,'draft')
 assert.equal(convertDocument({...d,_id:'versions.release.p'}).status,'excluded')
 assert.equal(makeManifest([d,draft],{projectId:'test',dataset:'fixture'}).summary.scanned,2)
 assert.notEqual(hash(d),hash(draft))
})
test('orientation and mobile defaults are explicit; unknown orientation blocks',()=>{
 const s=slide([media(8)]);delete s.mobileOrientation
 assert.equal(convertSlide(s,0).proposed.layoutV2.mobile.orientation,'landscape')
 s.mobileOrientation='sideways';assert.equal(convertSlide(s,0).status,'blocked')
})
