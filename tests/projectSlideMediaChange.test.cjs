const assert = require('node:assert/strict')
const {test} = require('node:test')
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm')
const ts = require('typescript')
const {PatchEvent, set, insert, unset} = require('sanity')
function load(name) {
  const filename = path.resolve('utils', name + '.ts'), module = {exports: {}}
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  }).outputText
  vm.runInThisContext('(function(require,module,exports){' + code + '\n})', {filename})(require,module,module.exports)
  return module.exports
}
const {projectSlideMediaChange} = load('projectSlideMediaChange')
const {validSlideV2, slideV2Error} = load('projectSlideV2')
const {validV2: auditValidV2, convertSlide} = require('../scripts/layout-migration/convert.cjs')
const media = (key, desktopSpan = 16, mobileSpan = 8) => ({_key: key, desktopSpan, mobileSpan})
const slide = () => ({layoutV2: {version: 2, desktop: {mode: 'justify'}, mobile: {mode: 'justify', auto: true, orientation: 'portrait'}}, media: [media('a')]})
const addition = () => PatchEvent.from(insert([media('b', 6, 3)], 'after', ['media', -1]))

test('adding a second media atomically changes both Justify modes, preserving sizes and Auto', () => {
  const value = slide(), before = JSON.stringify(value), event = addition()
  const result = projectSlideMediaChange(value, event)
  assert.equal(result.patches[0], event.patches[0])
  assert.deepEqual(result.patches.slice(1).map(p => [p.path,p.value]), [
    [['layoutV2','desktop','mode'],'center'], [['layoutV2','mobile','mode'],'center'],
  ])
  assert.equal(JSON.stringify(value), before)
  const next = {...value, media: [...value.media, media('b',6,3)], layoutV2: {...value.layoutV2, desktop: {mode:'center'}, mobile: {...value.layoutV2.mobile, mode:'center'}}}
  assert.equal(validSlideV2(next), true)
})
test('manual mobile Justify also switches while keeping orientation and Auto off', () => {
  const value = slide(); value.layoutV2.desktop.mode = 'center'; value.layoutV2.mobile.auto = false
  const result = projectSlideMediaChange(value, addition())
  assert.deepEqual(result.patches.slice(1).map(p => p.path), [['layoutV2','mobile','mode']])
  assert.equal(value.layoutV2.mobile.auto, false)
  assert.equal(value.layoutV2.mobile.orientation, 'portrait')
})
test('duplicate and whole-array replacement switch modes without resizing', () => {
  const value = slide()
  for (const event of [PatchEvent.from(insert([media('b')], 'after', ['media',{_key:'a'}])), PatchEvent.from(set([media('a'),media('b')], ['media']))]) {
    assert.equal(projectSlideMediaChange(value,event).patches.length,3)
  }
  const next = {...value, media:[media('a'),media('b')], layoutV2:{...value.layoutV2,desktop:{mode:'center'},mobile:{...value.layoutV2.mobile,mode:'center'}}}
  assert.equal(slideV2Error(next), 'Layout exceeds max column size (24).')
  next.media = [media('a',6,8),media('b',6,8)]
  assert.equal(slideV2Error(next), undefined)
  next.layoutV2.mobile.auto = false
  assert.equal(slideV2Error(next), 'Layout exceeds max column size (12).')
})
test('asset edits, single-item replacement, reorder, and removal do not change Justify', () => {
  const value = slide()
  for (const event of [PatchEvent.from(set('image-ref',['media',{_key:'a'},'image','asset','_ref'])), PatchEvent.from(set([media('b')],['media'])), PatchEvent.from([unset(['media',{_key:'a'}]),insert([media('a')],'after',['media',-1])]), PatchEvent.from(unset(['media',{_key:'a'}]))]) {
    assert.equal(projectSlideMediaChange(value,event), event)
  }
})
test('legacy layouts and Center layouts are passed through unchanged', () => {
  const event = addition(), value = slide()
  assert.equal(projectSlideMediaChange({media:value.media},event),event)
  value.layoutV2.desktop.mode = value.layoutV2.mobile.mode = 'center'
  assert.equal(projectSlideMediaChange(value,event),event)
})
test('previously saved multi-media Justify has an actionable validation message', () => {
  const value = slide(); value.media.push(media('b',6,3))
  assert.equal(slideV2Error(value),'Justify requires one media item. Choose Center.')
})
test('Auto ignores retained manual composition; manual mode and audit enforce the same contract', () => {
  for (const mode of ['center','justify']) {
    const value = slide()
    value.layoutV2.desktop.mode = 'center'
    value.layoutV2.mobile.mode = mode
    value.media = [media('a',6,8),media('b',6,8)]
    const before = JSON.stringify(value)
    assert.equal(validSlideV2(value),true)
    assert.equal(auditValidV2(value),true)
    assert.equal(convertSlide(value,0).status,'already-migrated')
    assert.equal(JSON.stringify(value),before)
    value.layoutV2.mobile.auto = false
    assert.equal(validSlideV2(value),false)
    assert.equal(auditValidV2(value),false)
    assert.equal(slideV2Error(value),mode === 'center' ? 'Layout exceeds max column size (12).' : 'Justify requires one media item. Choose Center.')
  }
})
