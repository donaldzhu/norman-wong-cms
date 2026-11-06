import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
function load(path) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  const module = {exports: {}}
  new Function('exports', 'module', source)(module.exports, module)
  return module.exports
}
const cms = load('../utils/projectSlideMockLayout.ts')
const frontend = load('../../norman-wong-svelte/src/lib/utils/projectSlideLayout.ts')
const item = (span, mobile, key = 'a') => ({_key:key, mediaType:'image', desktopStart:1, desktopEnd:1+span, ...(mobile === undefined ? {} : {mobileStart:1,mobileEnd:1+mobile}), image:{asset:{metadata:{dimensions:{aspectRatio:1.5}}}}})
assert.equal(cms.initialMobileLayout([item(8)]).auto, true)
for (let count=1;count<=4;count++) {
  const preset = [0,8,6,4,3][count]
  assert.equal(cms.initialMobileLayout(Array.from({length:count}, (_,i)=>item(6,preset,String(i)))).auto,true)
}
assert.equal(cms.initialMobileLayout([item(8,10)]).manual.spans.a,10)
assert.equal(cms.initialMobileLayout([item(8,12)]).manual.mode,'justify')
assert.equal(cms.initialMobileLayout([item(8,6),item(8,undefined,'b')]).auto,false)
assert.equal(cms.initialMobileLayout([{...item(8),mobileStart:1}]).auto,false)
assert.equal(cms.initialMobileLayout([item(8)]).orientation,'landscape')
assert.equal(cms.initialMobileLayout([item(8)],'portrait').orientation,'portrait')
let cases=0
function check(spans) {
  const total=spans.reduce((a,b)=>a+b,0)
  if(total<=24) assert.ok(spans.reduce((sum,s)=>sum+s/2,0)<=12)
  const media=spans.map((s,i)=>item(s,undefined,String(i)))
  const budget=cms.mockBudget(media,cms.initialMockLayout(media).sizes)
  assert.equal(budget.valid,total<=24)
  if(total<=24) for(const mobile of [false,true]) for(const stacked of mobile?[false,true]:[false]) {
    const columns=mobile?spans.map(s=>s/2):spans
    const dimensions=mobile?cms.MOBILE_VIEWPORT:cms.MOCK_VIEWPORT
    const actual=cms.mockGeometry(columns,spans.map(()=>1.5),mobile,stacked)
    const expected=mobile?frontend.resolveMobileLayout(media,dimensions.width,dimensions.height,20,stacked):frontend.resolveDesktopLayout(media,dimensions.width,dimensions.height,20)
    actual.forEach((value,i)=>{assert.ok(Math.abs(value.width-expected.items[i].width)<1e-8);assert.ok(Math.abs(value.height-expected.items[i].height)<1e-8)})
  }
  cases++
  if(spans.length<4) for(const size of cms.MOCK_SIZES) check([...spans,size])
}
for(const size of cms.MOCK_SIZES) check([size])
assert.equal(cms.mockGeometry([8],[1.5])[0].width,416)
console.log(`Passed initialization, legacy preservation, budget and frontend parity checks (${cases} size combinations).`)

// Independent expected dimensions catch shared CMS/frontend containment regressions.
const tall = cms.mockGeometry([10],[0.25])[0]
assert.equal(tall.width,525)
assert.equal(tall.height,2100)
const mobileTall = cms.mockGeometry([5],[0.1],true)[0]
assert.ok(mobileTall.height <= 844)
