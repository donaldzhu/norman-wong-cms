const fs=require('fs'),path=require('path'),vm=require('vm')
const base=process.cwd(),req=require('module').createRequire(path.join(base,'package.json')),ts=req('typescript'),React=req('react'),{JSDOM}=req('jsdom')
const dom=new JSDOM('<div id="root"></div>');global.window=dom.window;global.document=dom.window.document;global.HTMLElement=dom.window.HTMLElement;global.IS_REACT_ACT_ENVIRONMENT=true
const {act}=React,{createRoot}=req('react-dom/client'),assert=require('assert/strict')
const client={fetch:async()=>[]},cache=new Map()
const ui=new Proxy({}, {get:(_,name)=>props=>{const tag=name==='Button'?'button':name==='Switch'?'input':name==='Select'?'select':name==='Text'?'span':'div';const out={};for(const k of ['onClick','onChange','value','checked','disabled','id','type','aria-pressed','aria-label'])if(props[k]!==undefined)out[k]=props[k];if(name==='Switch')out.type='checkbox';return tag==='input'?React.createElement(tag,out):React.createElement(tag,out,props.text,props.children)}})
function load(file){if(!path.extname(file))file+='.ts';if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;const local=id=>id==='@sanity/ui'?ui:id==='sanity'?{useClient:()=>client}:id==='@sanity/image-url'?{createImageUrlBuilder:()=>({image:()=>({width:()=>({url:()=>''})})})}:id==='./projectSlideMockPreview'?{ProjectSlideMockPreview:()=>React.createElement('div',null,'Preview')}:id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:file})(local,m,m.exports);return m.exports}
const {ProjectSlideMockDialog}=load(path.join(base,'components/projectSlide/projectSlideMockDialog.tsx'))
const writes=[];let remote
function Host(){const [value,setValue]=React.useState({layoutV2:{_type:'projectSlideLayoutV2',version:2,desktop:{_type:'projectSlideDesktopLayout',mode:'center'},mobile:{_type:'projectSlideMobileLayout',auto:false,mode:'center',orientation:'landscape'}},media:['a','b'].map(_key=>({_key,desktopSpan:8,mobileSpan:4,desktopStart:1,desktopEnd:9,mobileStart:1,mobileEnd:7}))});remote=()=>setValue(v=>({...v,layoutV2:{...v.layoutV2,mobile:{...v.layoutV2.mobile,orientation:'portrait'}}}));return React.createElement(ProjectSlideMockDialog,{value,onClose:()=>{},onLayoutChange:(layoutV2,spans)=>{writes.push({layoutV2,spans});setValue(v=>({...v,layoutV2,media:v.media.map(m=>({...m,...spans.find(s=>s._key===m._key)}))}))}})}
async function click(text,index=0){await act(async()=>[...document.querySelectorAll('button')].filter(b=>b.textContent===text)[index].click())}
async function verifyRecovery() {
  for (const mode of ['center', 'justify']) {
    const recoveredWrites = []
    const initial = {layoutV2:{version:2,desktop:{mode},mobile:{auto:true,mode,orientation:'portrait'}},media:['a','b'].map(_key=>({_key,desktopSpan:16,mobileSpan:3,desktopStart:1,desktopEnd:7,mobileStart:1,mobileEnd:7}))}
    function RecoveryHost() {
      const [value,setValue] = React.useState(initial)
      return React.createElement(ProjectSlideMockDialog,{value,onClose:()=>{},onLayoutChange:(layoutV2,spans)=>{
        recoveredWrites.push({layoutV2,spans})
        setValue(v=>({...v,layoutV2,media:v.media.map(m=>({...m,...spans.find(s=>s._key===m._key)}))}))
      }})
    }
    const root = createRoot(document.getElementById('root'))
    await act(async()=>root.render(React.createElement(RecoveryHost)))
    assert.equal(recoveredWrites.length,0,'opening an invalid slide must not mutate it')
    if (mode === 'justify') {
      assert.ok(document.body.textContent.includes('Justify requires one media item. Choose Center.'))
      await click('Center')
      assert.equal(recoveredWrites.length,0,'over-budget Center remains local')
    }
    assert.ok(document.body.textContent.includes('Layout exceeds max column size (24).'))
    assert.equal([...document.querySelectorAll('button')].filter(b=>b.textContent==='XXL (16)' && b.getAttribute('aria-pressed')==='true').length,2,'saved V2 sizes survive invalidity instead of reverting to legacy XS')
    await click('S (8)',0)
    assert.equal(recoveredWrites.length,1)
    assert.equal(recoveredWrites[0].layoutV2.desktop.mode,'center')
    assert.equal(recoveredWrites[0].layoutV2.mobile.mode,'center')
    assert.equal(recoveredWrites[0].layoutV2.mobile.auto,true)
    assert.deepEqual(recoveredWrites[0].spans.map(m=>m.desktopSpan),[8,16])
    await act(async()=>root.unmount())
  }
}
async function verifyAutoRetention() {
  for (const mode of ['center','justify']) {
    const autoWrites = []
    const initial = {layoutV2:{version:2,desktop:{mode:'center'},mobile:{auto:true,mode,orientation:'portrait'}},media:['a','b'].map(_key=>({_key,desktopSpan:8,mobileSpan:8,desktopStart:1,desktopEnd:17,mobileStart:1,mobileEnd:9}))}
    function AutoHost() {
      const [value,setValue] = React.useState(initial)
      return React.createElement(ProjectSlideMockDialog,{value,onClose:()=>{},onLayoutChange:(layoutV2,spans)=>{
        autoWrites.push({layoutV2,spans})
        setValue(v=>({...v,layoutV2,media:v.media.map(m=>({...m,...spans.find(s=>s._key===m._key)}))}))
      }})
    }
    const root = createRoot(document.getElementById('root'))
    await act(async()=>root.render(React.createElement(AutoHost)))
    assert.equal(autoWrites.length,0)
    assert.ok(!document.body.textContent.includes('Layout exceeds'))
    assert.ok(!document.body.textContent.includes('Justify requires'))
    await click('XS (6)',0)
    assert.equal(autoWrites.length,1,'Auto desktop edits must save despite unused manual overage')
    assert.equal(autoWrites[0].layoutV2.mobile.auto,true)
    assert.equal(autoWrites[0].layoutV2.mobile.mode,mode)
    assert.deepEqual(autoWrites[0].spans.map(m=>m.mobileSpan),[8,8],'manual settings must be retained')
    await act(async()=>document.getElementById('mock-mobile-auto').click())
    assert.equal(autoWrites.length,1,'invalid pending manual layout must not save when Auto is disabled')
    assert.ok(document.body.textContent.includes(mode==='center'?'Layout exceeds max column size (12).':'Justify requires one media item. Choose Center.'))
    await click('Mobile')
    if (mode==='justify') await click('Center')
    await click('XS (3)',0)
    assert.equal(autoWrites.length,2)
    assert.equal(autoWrites[1].layoutV2.mobile.auto,false)
    assert.equal(autoWrites[1].layoutV2.mobile.mode,'center')
    assert.deepEqual(autoWrites[1].spans.map(m=>m.mobileSpan),[3,8])
    assert.ok(!document.body.textContent.includes('Slide changed'))
    await act(async()=>root.unmount())
  }
}
;(async()=>{const root=createRoot(document.getElementById('root'));await act(async()=>root.render(React.createElement(Host)));assert.equal(writes.length,0);await click('XXL (16)',0);assert.equal(writes.length,1);assert.ok(!document.body.textContent.includes('Slide changed'));await click('XXL (16)',1);assert.equal(writes.length,1);assert.ok(document.body.textContent.includes('Layout exceeds max column size (24).'));await click('S (8)',0);assert.equal(writes.length,2);await act(async()=>remote());assert.ok(document.body.textContent.includes('Slide changed'));await click('XS (6)',0);assert.equal(writes.length,2);await act(async()=>root.unmount());await verifyRecovery();await verifyAutoRetention();console.log('PASS: no write on open, valid writes echo cleanly, invalid edits stay local, recovery saves, remote changes block overwrite; invalid V2 sizes and Justify recover without legacy fallback.')})().catch(e=>{console.error(e);process.exitCode=1})
