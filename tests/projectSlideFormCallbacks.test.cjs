const assert = require('node:assert/strict')
const {test} = require('node:test')
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm')
const ts = require('typescript'), React = require('react'), sanity = require('sanity')
const {JSDOM} = require('jsdom')
const dom = new JSDOM('<div id="root"></div>')
global.window = dom.window
global.document = dom.window.document
global.HTMLElement = dom.window.HTMLElement
global.IS_REACT_ACT_ENVIRONMENT = true
const {createRoot} = require('react-dom/client')
const ui = new Proxy({}, {get: (_, name) => props => React.createElement(
  name === 'Button' ? 'button' : 'div',
  name === 'Button' ? {onClick: props.onClick, disabled: props.disabled} : {}, props.text, props.children,
)})
const cache = new Map()
function load(file) {
  if (!path.extname(file)) file += '.ts'
  if (cache.has(file)) return cache.get(file).exports
  const module = {exports: {}}
  cache.set(file, module)
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX},
  }).outputText
  const local = id => id === '@sanity/ui' ? ui
    : id === './projectSlideMockDialog' ? {ProjectSlideMockDialog: () => null}
    : id === '../common/errorIcon' ? {ErrorIcon: () => null}
    : id.startsWith('.') ? load(path.resolve(path.dirname(file), id)) : require(id)
  vm.runInThisContext('(function(require,module,exports){' + code + '\n})', {filename:file})(local,module,module.exports)
  return module.exports
}
const {ProjectSlideGridButton} = load(path.resolve('components/projectSlide/projectSlideGridButton.tsx'))

test('nested Sanity field callbacks reach the media guard exactly once, with scoped paths', async () => {
  const writes = [], focusCalls = []
  let edit, focus
  const root = createRoot(document.getElementById('root'))
  const value = {layoutV2:{version:2,desktop:{mode:'justify'},mobile:{auto:true,mode:'justify',orientation:'portrait'}},media:[{_key:'a',desktopSpan:16,mobileSpan:8}]}
  const slidePath = ['slides', {_key:'slide-a'}]
  const onChange = event => writes.push(sanity.PatchEvent.from(event).prefixAll(slidePath[1]).prefixAll('slides'))
  const callbacks = {onChange, onPathFocus: p => focusCalls.push(p), onPathBlur:()=>{}, onPathOpen:()=>{}, onSetPathCollapsed:()=>{}, onSetFieldSetCollapsed:()=>{}, onFieldGroupSelect:()=>{}}
  function MediaInputProbe() {
    const current = sanity.useFormCallbacks()
    edit = event => current.onChange(event)
    focus = () => current.onPathFocus(['media', {_key:'a'}])
    return null
  }
  function ArrayFieldProbe() {
    // Sanity's ObjectInput member fields use context, not renderDefault's onChange.
    const current = sanity.useFormCallbacks()
    return React.createElement(sanity.FormCallbacksProvider, {...current,
      onChange: event => current.onChange(sanity.PatchEvent.from(event).prepend(sanity.setIfMissing([])).prefixAll('media')),
    }, React.createElement(MediaInputProbe))
  }
  async function render(nextValue = value, readOnly = false) {
    await React.act(async () => root.render(React.createElement(sanity.FormCallbacksProvider, callbacks,
      React.createElement(ProjectSlideGridButton, {value:nextValue, path:slidePath, readOnly, onChange,
        renderDefault: () => React.createElement(ArrayFieldProbe),
      }),
    )))
  }
  try {
    await render()
    assert.equal(writes.length, 0, 'mounting must not write')
    await React.act(async () => focus())
    assert.deepEqual(focusCalls, [['media', {_key:'a'}]])
    await React.act(async () => edit(sanity.PatchEvent.from(sanity.insert([{_key:'b',desktopSpan:6,mobileSpan:3}], 'after', [-1]))))
    assert.equal(writes.length, 1, 'addition and mode changes must be one event')
    assert.deepEqual(writes[0].patches.map(p => p.path), [
      [...slidePath, 'media'], [...slidePath, 'media', -1],
      [...slidePath, 'layoutV2', 'desktop', 'mode'], [...slidePath, 'layoutV2', 'mobile', 'mode'],
    ])
    assert.deepEqual(writes[0].patches.slice(-2).map(p => p.value), ['center','center'])
    assert.equal(value.layoutV2.mobile.auto, true)
    assert.equal(value.media[0].desktopSpan,16)

    await render({...value, media:[...value.media,{_key:'remote',desktopSpan:6,mobileSpan:3}]})
    assert.equal(writes.length,1,'remote updates must not trigger repair writes')
    await render(value,true)
    await React.act(async () => edit(sanity.PatchEvent.from(sanity.insert([{_key:'blocked'}],'after',[-1]))))
    assert.equal(writes.length,1,'read-only fields must not write')
    await render(value)
    await React.act(async () => edit(sanity.PatchEvent.from(sanity.set('asset-ref',[{_key:'a'},'image','asset','_ref']))))
    assert.equal(writes.length,2)
    assert.ok(writes[1].patches.every(p => !p.path.includes('layoutV2')),'asset replacement must not change mode')
  } finally {
    await React.act(async () => root.unmount())
  }
})
