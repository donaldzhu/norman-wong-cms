# CMS custom component reliability and UX plan

Date: 2026-11-05  
Status: Proposed; implementation has not started.

This plan covers the 17 audit findings and three additional UX risks. Work is grouped by migration impact. Within each group, address data integrity and error handling before interface polish. Creating this plan does not authorize application-code changes or production-content changes.

Implement this in small, reviewable stages. Preserve existing content and layout choices unless a change is explicitly required to correct a defect. Proposed behavior choices below must be resolved before implementing the affected step.


## How to read the examples

Each step includes a small, commented example and an explanation of its effect. These are implementation sketches, not completed or tested application changes. Imports and surrounding component code are sometimes omitted; named proposed helpers are identified where used. Tests using `renderHook`, `act`, and `expect` assume a future React testing setup, which this repository does not currently configure. The examples do not replace the acceptance criteria.

Keep the existing persisted field names, document IDs, array item `_key` values, media objects, and `rowSettings: number[]` representation. UI-only props such as `device` or `variant` do not need to become stored fields. The migration assessment at the end identifies the exceptions and rollout order.

## Plan sections

- [A. Changes that do not require migration](#a-changes-that-do-not-require-migration): application, validation, and UI fixes that preserve stored data shapes.
- [B. Changes that require migration if adopted](#b-changes-that-require-migration-if-adopted): converting existing weak project references to strong references.
- [C. Existing-content cleanup that may be needed](#c-existing-content-cleanup-that-may-be-needed): editorial corrections and targeted backfills, kept separate from structural migrations.
- [D. Verification and rollout](#d-verification-and-rollout): acceptance checks and the procedure for any authorized content writes.

Original step numbers are retained for traceability. Step 5 is split into **5A (validation only)** and **5B (reference conversion)**. Section A can proceed independently of choosing strong references. “No migration” means no required bulk rewrite of existing content; normal editor actions can still save changes. Creating or reorganizing this document does not authorize implementation.

## A. Changes that do not require migration

Preserve current document IDs, field names, array item keys, asset references, and numeric row arrays. This section does not include bulk content repair or removal of stored `_weak` markers. Use advisory membership warnings while the 13 existing selections are reviewed; do not silently introduce a publication blocker.

### 1. Establish the baseline and review existing content

- [ ] Record the current TypeScript and lint results.
- [ ] Create representative test fixtures covering image-only and video-only projects, repeated assets, published projects with drafts, missing references, processing videos, and media hidden on mobile.
- [ ] Run a read-only content audit for missing assets, deleted project references, media belonging to the wrong project, duplicate singleton documents, and inconsistent row settings.
- [ ] Separate existing content problems from code defects.

**Complete when:** there is a reproducible test dataset and a list of existing content problems. Any necessary content repairs are documented separately from application changes.

**Example: inventory weak references without writing anything.**

```groq
// Execute with the raw perspective to include draft and published documents.
*[_type == "allProjects"]{
  _id,
  _rev,
  "weakProjectReferences": projects[project._weak == true]{
    _key,
    "projectId": project._ref
  }
}
```

This produces a review list, not a migration. Inspect target existence separately with the appropriate perspective; a draft-only target is different from a deleted target. Keep `_rev` in any later repair report so an outdated report cannot overwrite intervening edits.

**Data impact:** none; read-only inspection.

### 2. Make project media loading reliable

Primary file: `components/hooks/useProjectSlides.ts`.

- [ ] Expose distinct states for no selection, loading, success, and failure.
- [ ] Reset results when the project changes or is cleared.
- [ ] Cancel obsolete requests where possible, and ensure responses cannot update state after their project has been superseded.
- [ ] Restart loading on every new request and finish it on both success and failure.
- [ ] Replace the unhandled rethrow with an error state and retry action.

**Complete when:** rapid A → B switching always produces B’s media, clearing the project clears its options, failed requests produce a recoverable message, and unmounting leaves no active requests updating the component.

**Example: prevent an old request from replacing the current project's result.**

```tsx
// Inside the hook. fetchProjectForEditor is the proposed helper in step 3.
// retryVersion is incremented by a Retry button.
useEffect(() => {
  if (!projectId) {
    setState({projectId: undefined, status: 'idle', slides: []})
    return
  }

  const controller = new AbortController()
  let current = true
  setState({projectId, status: 'loading', slides: []})

  async function load() {
    try {
      const project = await fetchProjectForEditor(
        client, projectId, controller.signal,
      )
      if (!current) return
      setState(project
        ? {projectId, status: 'success', slides: project.slides ?? []}
        : {projectId, status: 'error', slides: [], message: 'Project not found.'})
    } catch {
      if (!current) return // Ignore a cancelled or superseded request.
      setState({
        projectId, status: 'error', slides: [],
        message: 'Could not load project media. Try again.',
      })
    }
  }

  void load()
  return () => {
    current = false
    controller.abort()
  }
}, [client, projectId, retryVersion])

// Also hide old results during the render before the effect has reset state.
const visibleState = state.projectId === projectId
  ? state
  : {projectId, status: projectId ? 'loading' : 'idle', slides: []}
```

Model `state` as a typed union during implementation. The request guard prevents late responses from winning; the ID comparison prevents even a brief render of A's options while B is selected. Keep diagnostic error details separate from the friendly UI message.

**Data impact:** none; local component state only.

### 3. Define which project version supplies media, and keep it current

Primary files: `components/hooks/useProjectSlides.ts`, `utils/refs.ts`, and `components/assetPicker/refMediaPickerButton.tsx`.

- [ ] Use draft content with published fallback for editing.
- [ ] Replace the unordered draft/published query with an explicit draft-first lookup or appropriately configured query perspective. Do not rely on the order of IDs inside a query parameter.
- [ ] Refresh when the picker opens.
- [ ] While it remains open, observe relevant project changes or provide an equivalent refresh mechanism.
- [ ] Share project data between related picker instances where practical, rather than issuing redundant requests from every field.

**Complete when:** newly added draft media appears without publishing or reloading Studio, removed media disappears, and opening or keeping a picker open does not leave it indefinitely stale.

**Example: explicitly query the draft-first view.**

```ts
// Proposed helper; ProjectSlideFormValue already exists in this repository.
async function fetchProjectForEditor(
  client: SanityClient,
  projectRef: string,
  signal?: AbortSignal,
) {
  const id = projectRef.replace(/^drafts\./, '')
  const editorClient = client.withConfig({
    perspective: 'drafts',
    useCdn: false,
  })

  return editorClient.fetch<{slides?: ProjectSlideFormValue[]} | null>(
    '*[_type == "project" && _id == $id][0]{slides}',
    {id},
    {signal},
  )
}
```

The drafts perspective overlays a draft onto its canonical ID, falling back to published content. This helper supports the current draft/published workflow; release-version support is not being added here. Scope this configuration to the editor query, not the website's public client.

```tsx
// Reuse step 2's guarded loader when opening the picker or clicking Refresh.
const refresh = useCallback(() => setRetryVersion(n => n + 1), [])
useEffect(() => {
  if (open && projectId) refresh()
}, [open, projectId, refresh])
```

This is the open/refresh portion. A shared project subscription should also trigger `refresh()` while the picker is visible, handle listener failures, and unsubscribe on close. Avoid one identical listener per media tile.

**Data impact:** none; changes which version is read, not how content is stored.

### 4. Keep selected media consistent with the selected project

Primary files: `components/allProjects/allProjectsContextProvider.tsx`, `utils/field.ts`, and `schemaTypes/objects/allProjects/allProjectsMedia.ts`.

- [ ] Add membership warnings for All Projects media while the editorial policy is reviewed. Do not introduce hard membership enforcement yet; see section C and the dry-run report.
- [ ] Check existing selections when the project reference changes and when the source project’s slides change.
- [ ] Preserve an existing selection visibly, mark it as no longer belonging to the selected project, and offer replacement or removal. Require a correction only if strict membership is later chosen. Do not silently erase selections or rearrange the media array.
- [ ] Keep “unable to load the project” separate from “this asset does not belong to the project.” A failed request must not invalidate otherwise valid content by pretending the project has no media.

**Complete when:** changing A to B cannot leave A’s media silently valid, and removing an asset from a project identifies affected selections with a clear correction path.

**Example: validate an entry without deleting its previous choices.**

```ts
// Sketch for validation on allProjectsProject, where row.project and
// row.media are available together. Apply appropriate schema types.
validation: rule => rule.custom(async (row, context) => {
  if (!row?.project?._ref) return true // The required-field rule covers this.
  try {
    const project = await fetchProjectForEditor(
      context.getClient({apiVersion: '2026-05-01'}), row.project._ref,
    )
    if (!project) return 'The selected project could not be found.'

    const allowed = new Set(mediaRefsFromProject(project.slides).map(
      ref => `${ref.mediaType}:${ref.media.asset._ref}`,
    ))
    const invalid = (row.media ?? []).filter(item => {
      const ref = mediaDataToMediaRef(item)
      if (!isValidMediaRef(ref)) return false // Asset validation covers this.
      return !allowed.has(`${ref.mediaType}:${ref.media.asset._ref}`)
    })

    return invalid.length ? {
      message: 'Review media that is not in this project’s current slides.',
      paths: invalid.map(item => ['media', {_key: item._key}]),
    } : true
  } catch {
    return 'Could not verify project media. Retry the check.'
  }
}).warning() // Advisory until the 13 existing selections are reviewed.
```

The existing reference helpers supply identity conversion; the project-loading helper is proposed in step 3. The form should use the same membership calculation for immediate feedback. Arrange revalidation when the referenced project changes; validation does not automatically subscribe to every external document it reads. Coalesce repeated lookups during validation rather than fetching once per asset.

**Data impact:** no migration for advisory validation. The 13 existing membership mismatches require an editorial decision, not automatic deletion or migration. Any later content correction belongs to section C; only promote the rule to an error after that decision.

### 5A. Strengthen validation without changing reference strength

Primary files: `utils/field.ts`, `schemaTypes/objects/projectSlide/projectSlideMedia.ts`, and `schemaTypes/objects/allProjects/allProjectsProject.ts`.

- [ ] Require an actual asset reference in the active image/video field.
- [ ] Preserve the intended desktop fallback when an optional mobile override is absent.
- [ ] Validate missing video assets explicitly where the plugin’s weak reference does not provide that protection.
- [ ] Distinguish missing, failed, and still-processing assets in the interface.
- [ ] If weak project references are retained, add explicit publish-time target-existence validation. This does not provide backend protection against a later deletion. Strong-reference conversion is isolated in section B, step 5B.

**Complete when:** empty media objects and deleted destinations fail actual Sanity document validation, valid content still passes, and every error points to an editable field with an actionable message.

**Example: require the selected asset, not just an object wrapper.**

```ts
// Replaces the truthiness-only check inside the existing validateValue helper.
const parent = context.parent as {mediaType?: MediaType} | undefined
if (parent?.mediaType !== mediaType) return true

const media = value as {asset?: {_ref?: string}} | undefined
return Boolean(media?.asset?._ref?.trim()) ||
  `Add ${mediaType === MediaType.IMAGE ? 'an image' : 'a video'}.`
```

This is the first validation layer. It preserves conditional validation of the active type. It does not establish that an asset exists or a video has finished processing; those checks remain separate. Optional mobile overrides retain their fallback behavior.

**Data impact:** no stored format change or reference conversion. The dry run found no missing-asset or missing-project failures. If future checks find invalid entries, handle their repairs separately in section C.


### 6. Correct picker choices and state messaging

Primary files: `components/assetPicker/refMediaPickerButton.tsx`, `components/assetPicker/refMediaPickerGrid.tsx`, and `utils/refs.ts`.

- [ ] Filter references by the requested media type before calculating availability.
- [ ] Deduplicate by media type and asset ID, then use that identity consistently for rendered keys.
- [ ] Give each state its own presentation: select a project, loading, load failure with retry, no matching media, and available choices.
- [ ] Keep the existing selection identifiable when replacing it.

**Complete when:** an image picker for a video-only project clearly reports that no images are available; repeated assets appear once; loading never looks like an empty project; and no duplicate-key warnings occur.

**Example: filter first, then deduplicate and calculate the empty state.**

```ts
const choices = Array.from(new Map(
  mediaRefsFromProject(slides)
    .filter(ref => ref.mediaType === mediaType)
    .map(ref => [`${ref.mediaType}:${ref.media.asset._ref}`, ref] as const),
).values())

const isEmpty = status === 'success' && choices.length === 0
const canPick = !readOnly && status === 'success' && !isEmpty

// Render loading/error states before deciding the project has no media.
if (status === 'loading') return <Text>Loading project media…</Text>
if (status === 'error') return <Button text="Retry loading media" onClick={retry} />
```

Use the same type-and-ID key for each rendered choice. A video-only project now has zero image choices. These are picker options: do not deduplicate the actual project slides, where repeating an asset may be intentional.

**Data impact:** none; deduplicates the derived options only.

### 7. Give media previews explicit loading, processing, and failure states

Primary file: `components/previews/mediaRefPreview.tsx`.

- [ ] Make preview state belong to the current asset ID and media type.
- [ ] Clear or hide the previous asset’s thumbnail immediately when the reference changes.
- [ ] Handle empty query results without throwing.
- [ ] Include all relevant effect dependencies, handle image download errors, and replace silent catches with appropriate visible fallbacks.
- [ ] Refresh processing videos through a subscription or bounded polling.
- [ ] After the waiting limit, show an explicit processing message and retry control rather than an endless spinner.
- [ ] Stop background work when the preview is no longer needed.

**Complete when:** replacing a video never displays the old video as the new selection; missing or failed assets produce an error state; processing assets become ready without reopening Studio; and retries recover successfully.

**Example: show a thumbnail only when it belongs to the current asset.**

```tsx
type PreviewState = {
  key: string
  status: 'loading' | 'processing' | 'ready' | 'error'
  url?: string
}

const key = `${mediaType}:${mediaRef}`
const current = preview?.key === key ? preview : undefined

if (current?.status === 'error') {
  return <Button text="Preview unavailable — retry" onClick={retryPreview} />
}
if (current?.status === 'processing') {
  return <Text>Video is still processing.</Text>
}
if (current?.status !== 'ready' || !current.url) return <Spinner />

return <img
  src={current.url}
  alt=""
  onError={() => setPreview(previous => previous?.key === key
    ? {...previous, status: 'error', url: undefined}
    : previous)}
/>
```

`preview`, `setPreview`, and `retryPreview` belong to the proposed preview hook. Its loader must handle an empty query result explicitly, classify processing versus failed assets from asset status, and guard stale completions as in step 2. Bound processing retries, clear their timers on cleanup, and provide a retry action when the waiting limit is reached. Missing references should render an empty placeholder before entering this loading UI.

**Data impact:** none; no asset documents are modified by preview recovery.

### 8. Preserve media proportions in layout previews

Primary files: `components/previews/mediaRefPreview.tsx` and `components/projectSlide/projectSlideGridMedia.tsx`.

- [ ] Separate selection-thumbnail rendering from layout-preview rendering. Selection tiles can remain square; the slide planner should preserve the source image/video proportions.
- [ ] Ensure Mux thumbnail requests used by the planner do not force square cropping.
- [ ] Keep fit behavior consistent between images and videos.

**Complete when:** portrait, landscape, and square videos retain their expected proportions in both desktop and mobile planner views. Check these against representative frontend layouts before claiming the preview is accurate.

**Example: use a square thumbnail only for a selection tile.**

```ts
function muxThumbnail(playbackId: string, variant: 'tile' | 'layout') {
  const params = new URLSearchParams({time: '0', width: '800'})
  if (variant === 'tile') {
    params.set('height', '800')
    params.set('fit_mode', 'smartcrop')
  }
  // A layout preview omits the fixed square height.
  return `https://image.mux.com/${encodeURIComponent(playbackId)}/thumbnail.jpg?${params}`
}
```

```tsx
// Example horizontal layout preview; preserve the image's natural ratio.
<img src={muxThumbnail(playbackId, 'layout')} alt=""
  style={{width: '100%', height: 'auto', objectFit: 'contain'}} />
```

Keep the existing orientation-aware sizing for mobile portrait layouts, where height may drive the size. Verify real output against Mux behavior and the frontend's fit rules. `variant` is a component prop, not a new CMS field.

**Data impact:** none; existing references and layout coordinates remain unchanged.

### 9. Honor read-only state throughout custom controls

Primary areas: `components/assetPicker/`, `components/allProjects/`, and `components/projectSlide/`.

- [ ] Pass `readOnly` through pickers, previews, planners, orientation controls, and row steppers.
- [ ] Guard mutation handlers as well as disabling their buttons.
- [ ] Prevent automatic normalization from emitting patches while read-only.
- [ ] Handle the case where a form becomes read-only after a dialog has already opened.
- [ ] Allow harmless inspection: opening a planner, switching preview tabs, and retrying a failed read can remain available.

**Complete when:** read-only fixtures emit zero patches on mount or interaction, including through already-open dialogs. Editable fixtures retain their existing capabilities.

**Example: protect both the visible control and the write path.**

```tsx
const handleClear = () => {
  if (readOnly) return
  onChange(unset())
}

<Button text="Clear field" disabled={readOnly} onClick={handleClear} />

useEffect(() => {
  if (readOnly) return
  // Use the shared normalization and structural-patch logic from step 10.
  // Do not write merely because a read-only preview has mounted.
  reconcileEditableRows()
}, [readOnly, reconcileEditableRows])
```

`reconcileEditableRows` is a proposed stable callback, not an existing API. It must emit nothing if the data is already consistent. Apply the same protection to picking, replacing, changing orientation, applying presets, and changing row widths. Keep view-only controls enabled. Ensure callbacks receive updated `readOnly` values if permissions change while a dialog is open.

**Data impact:** no migration; prevents unintended writes.

### 10. Unify All Projects row calculation and make edits collaboration-safe

Primary files: `components/allProjects/allProjectsGridButton.tsx`, `components/allProjects/allProjectsGridPlanner.tsx`, and `schemaTypes/objects/allProjects/allProjectsLayout.ts`.

- [ ] Use one shared calculation for the media list, mobile visibility filtering, row counts, and planner display.
- [ ] Make the device explicit instead of inferring it from the minimum row width.
- [ ] Validate row widths as finite integers within the configured range.
- [ ] Handle invalid existing settings safely and identify any necessary repairs.
- [ ] Change individual row widths with targeted patches. Avoid replacing the entire settings array for a one-row edit.
- [ ] Review automatic append/truncate operations for conflicts with simultaneous edits and ensure normalization settles without repeated writes.

**Complete when:** saved and displayed mobile rows agree; hiding or revealing media produces consistent results; and two editors changing different rows preserve both changes. Read-only views must remain mutation-free.

**Example: calculate the same visible list everywhere and patch one row.**

```ts
// device is a component/configuration prop, not persisted content.
const isMobile = device === DeviceType.MOBILE
const visible = flattenProjectList(projects, isMobile)
const effectiveRows = autoPopulateRowSettings(rowSettings, visible.length, range)

function changeExistingRow(rowIndex: number, requested: number) {
  if (readOnly || !Number.isFinite(requested)) return
  // This example handles only an existing slot. Initialization and append/
  // truncate need their own structural patches, not an out-of-bounds set.
  if (!rowSettings || rowIndex < 0 || rowIndex >= rowSettings.length) return
  const width = Math.max(range.min, Math.min(range.max, Math.round(requested)))
  onChange(set(width, ['rowSettings', rowIndex]))
}
```

Both the writer and dialog must consume `visible` and the same effective-row calculation. Preserve `rowSettings` as an array of numbers. The targeted patch avoids overwriting another existing row, but it does not by itself solve simultaneous array resizing; test that separately. The current normalization helper also needs range/invalid-number handling.

**Data impact:** no migration for the calculation and patching fixes. Any batch correction of existing values belongs to section C. Incorrect stored row settings may need a reviewed recalculation. Do not convert rows to objects or add stored device fields as part of this fix.

### 11. Fix slide-grid interaction state and clarify Auto Layout

Primary files: `components/projectSlide/projectSlideGridInteraction.tsx`, `components/projectSlide/projectSlideGridDialog.tsx`, `components/projectSlide/projectSlideGridPreview.tsx`, `utils/projectSlide.ts`, and `utils/projectSlideAutoLayout.ts`.

- [ ] Reset the pending selection anchor when the active media, device tab, orientation, or dialog session changes.
- [ ] Use one consistent orientation fallback across the selector, preview, validation, and interaction layer.
- [ ] Make the two-click selection behavior understandable through visible selection feedback and concise instructions.
- [ ] Resolve Auto Layout’s scope before implementation. The proposed default is to apply it to the active device tab and preserve orientation. If the existing combined operation is retained, explicitly label that it replaces both layouts and changes mobile orientation.
- [ ] Review preset geometry visually before changing its numeric values; apparent asymmetries may be intentional design choices.

**Complete when:** the first click after switching context starts a fresh selection, labels match the active grid direction, and Auto Layout has a clear, predictable scope.

**Example: start a fresh selection when the grid context changes.**

```tsx
const orientation = mobileOrientation ?? Orientation.PORTRAIT

<ProjectSlideGridInteraction
  key={`${activeMediaKey}:${tab}:${orientation}`}
  tab={tab}
  orientation={orientation}
  onCommit={span => onSetGrid(span, activeMediaKey)}
/>
```

Changing the key remounts the small interaction component, clearing its pending anchor. Keep it unmounted when the dialog closes, as the current conditional dialog rendering does. Pass the same resolved orientation to the preview.

```ts
// Proposed preset helper signature if active-device-only behavior is chosen.
function buildDeviceLayoutPatches(keys, preset, device) {
  if (!isMediaCount(keys.length)) return []
  const spans = SLIDE_AUTO_LAYOUTS[preset][device][keys.length]
  return keys.flatMap((key, index) => [
    set(spans[index].start, getSlideGridKeyPath(key, device, 'start')),
    set(spans[index].end, getSlideGridKeyPath(key, device, 'end')),
  ])
  // No mobileOrientation patch and no patches for the other device.
}
```

The second sketch reuses the existing preset tables and helpers; add their TypeScript types in implementation. Apply it only after the scope decision. It changes the result of future button clicks, not existing saved layouts.

**Data impact:** no migration; do not reapply presets to existing content automatically.

### 12. Make the asset tools’ “Read-Only” promise accurate

Primary file: `sanity.config.ts`.

- [ ] Treat the standalone asset browsers separately from media inputs inside project forms.
- [ ] Review the locked plugins’ supported customization points.
- [ ] If browse-only behavior is intended, disable metadata editing, deletion, uploads, and other mutation actions in those standalone tools through supported APIs or a suitable read-only wrapper. Do not rely solely on CSS hiding.
- [ ] If editing is intentionally allowed, remove “Read-Only” from the titles instead. Resolve this decision before changing the tools.

**Complete when:** the labels match actual behavior, all exposed mutation routes have been checked, and ordinary project-field upload/editing workflows still work as intended.

**Example: make the label truthful if editing is intentionally retained.**

```ts
// Within the existing tools callback; this is the editable-tools option.
tools: previous => previous
  .filter(tool => !['vision', 'releases'].includes(tool.name))
  .map(tool => ({
    ...tool,
    title: tool.name === 'media' ? 'Images'
      : tool.name === 'mux' ? 'Videos'
      : tool.title,
  }))
```

This fixes the misleading label only; it does not make the tools read-only. If browse-only behavior is chosen, use supported customization verified against the installed plugins, or an owned read-only browser. Do not invent a `readOnly: true` plugin option or assume that `directUploads: false` blocks deletion. Keep project-field uploads available. UI controls do not replace backend permission enforcement.

**Data impact:** none; configuration/UI changes only.

### 13. Finish singleton creation protection

Primary files: `sanity.config.ts` and `structure/`.

- [ ] Filter Header, Info, Selected Works, and All Projects out of the global creation templates/options.
- [ ] Preserve their fixed navigation destinations and existing protections.
- [ ] Check global creation, document-list creation, and other applicable creation routes.
- [ ] Inventory any duplicate singleton documents already present and prepare a separate cleanup proposal; do not automatically merge or delete them.

**Complete when:** editors can reach each intended singleton but cannot accidentally create another instance through Studio’s creation menus.

**Example: remove singleton types from creation templates.**

```ts
const singletonTypes = new Set(['header', 'info', 'selectedWorks', 'allProjects'])

// Merge into the existing schema configuration.
schema: {
  types: schemaTypes,
  templates: templates => templates.filter(
    template => !singletonTypes.has(template.schemaType),
  ),
}
```

Keep the existing fixed-ID structure and document action filters. This prevents new duplicates through these templates; it does not rename, merge, or delete any existing document. Inspect alternate creation routes in the locked Studio version during acceptance testing.

**Data impact:** no migration for prevention. Existing duplicate cleanup belongs to section C as a separate content decision, especially if another document references a duplicate.

### 14. Repair accessibility and Studio focus integration

Primary areas: `components/assetPicker/`, `components/common/buttonToggleInput.tsx`, and both grid planners.

- [ ] Give asset-choice buttons meaningful accessible names, using available titles or filenames with sensible fallbacks.
- [ ] Expose selected states on media choices and toggles using appropriate semantics.
- [ ] Forward Sanity’s focus references and handlers to suitable focusable elements.
- [ ] Give grid controls meaningful row/column labels, associate validation messages with their controls, and make error explanations available without relying on hover or color.
- [ ] Use unique IDs for repeated dialogs and menus.
- [ ] Verify keyboard navigation, Escape behavior, focus containment, and focus returning to the triggering control.

**Complete when:** the picker and planners can be operated by keyboard; assistive technology can identify choices and selection state; and Studio can focus the relevant custom field from validation navigation.

**Example: give an image-only choice a name and selection state.**

```tsx
<button type="button"
  aria-label={`Select ${mediaType}: ${filename ?? `asset ${assetRef}`}`}
  aria-pressed={assetRef === selectedAssetRef}
  disabled={readOnly}
  onClick={() => onPick(assetRef)}
>
  <img src={thumbnailUrl} alt="" />
</button>
```

The decorative image can keep empty alternative text because its button now has a name. Resolve filenames in a shared lookup or use the ID fallback; do not add a saved filename field just for accessibility.

```tsx
// In the custom primitive toggle, attach Studio's focus props to one
// focusable wrapper and expose each button's selected state.
const {value: _domValue, ...focusProps} = props.elementProps
<div {...focusProps} tabIndex={0} role="group" aria-label={props.schemaType.title}>
  {options.map(option => <button key={option.value} type="button"
    aria-pressed={props.value === option.value}
    disabled={props.readOnly}
    onClick={() => handleSelect(option.value)}
  >{option.title}</button>)}
</div>
```

`options` represents the normalized schema list already used by the toggle. Verify the wrapper's focus behavior with the actual Studio, including bubbled focus events and error navigation. This example does not replace the dialog keyboard checks.

**Data impact:** none.

### 15. Check responsive layouts and replace fragile styling

Primary files: `components/projectSlide/projectSlideGridDialog.tsx`, `components/projectSlide/projectSlideMediaInput.tsx`, `components/allProjects/allProjectsGridPlanner.tsx`, and `components/assetPicker/refMediaPickerDialog.tsx`.

- [ ] Exercise the slide planner at narrow, medium, and wide viewport sizes, including increased browser zoom.
- [ ] Allow the fixed sidebar and preview to stack or resize when necessary, with intentional scrolling and reachable controls.
- [ ] Replace positional selectors against Sanity/plugin internals with supported customization or wrappers owned by this project.
- [ ] Verify dialog-header clicks, outside clicks, and nested menus do not dismiss dialogs unexpectedly.

**Complete when:** controls remain usable on narrow screens, no important content is clipped, and styling does not depend on an unnamed third child retaining a particular meaning.

**Example: own the planner layout instead of styling private child positions.**

```css
/* Classes placed on wrappers owned by this project. */
.slide-planner-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 1.5rem;
}
.slide-planner-preview { min-width: 0; }

@media (max-width: 700px) {
  .slide-planner-layout { grid-template-columns: minmax(0, 1fr); }
  .slide-planner-media-list { max-height: 12rem; overflow-y: auto; }
}
```

The exact breakpoint needs visual verification in the dialog. Where narrow dialog width is independent of viewport width, use a container-based layout or equivalent sizing. Apply owned wrappers around `renderDefault(props)` without stripping required Sanity props. Replace each positional override only after identifying the control it currently targets; this CSS does not magically restyle a plugin's internal controls.

**Data impact:** none.

## B. Changes that require migration if adopted

There is one identified migration candidate. It is optional: keeping weak references with explicit validation remains an alternative, with less backend protection.

### 5B. Convert existing All Projects project references from weak to strong

Primary file: `schemaTypes/objects/allProjects/allProjectsProject.ts`. Stored path: `allProjects.projects[].project`.

**Observed scope:** the November 5 dry run found five weak project references in the published All Projects document, all resolving to published projects. No conversion has been performed. Recheck drafts and current revisions before any migration.

- [ ] Resolve the proposed default of a strong All Projects project reference: editors may select a draft during preparation, but publication must wait until its destination exists publicly.
- [ ] Review existing weak references before changing them; changing the schema alone does not repair stored references.
- [ ] Produce a dry-run list of exact reference-field patches, preserving `_ref`, array `_key`, media, and layout values.
- [ ] Coordinate the schema change and stored-reference conversion so old Studio sessions do not recreate permanent weak references.
- [ ] Revalidate and verify target deletion protection after any authorized conversion.

**Complete when:** the agreed references are strong in stored content, valid workflows still publish successfully, and the original values and revisions are retained for a scoped rollback.

**Example: schema configuration for new strong references.**

```ts
// Proposed schema change, only if strong project references are chosen.
defineField({
  name: 'project',
  type: 'reference',
  to: [{type: 'project'}],
  // Omit weak: true; strong references are the default.
  validation: rule => rule.required(),
})
```

The stored reference still has the same `_type` and `_ref`. Existing `_weak: true` values need a targeted conversion to gain backend integrity protection. Do not remove `_weak` blindly from missing or draft-only targets. Keep the plugin's Mux reference schema outside the scope of this project-reference conversion.

Setting a schema reference to strong affects Studio's handling and validation, but existing stored `_weak: true` markers must be addressed to gain backend deletion protection. Sanity describes this distinction in its [reference schema documentation](https://www.sanity.io/docs/studio/reference-type) and [connected-content documentation](https://www.sanity.io/docs/studio/connected-content).

```ts
// Stored entry before conversion:
{
  _key: 'entry-a',
  project: {_type: 'reference', _ref: 'project-a', _weak: true},
  media: [/* unchanged */],
}

// Stored entry after conversion, once project-a exists publicly:
{
  _key: 'entry-a',
  project: {_type: 'reference', _ref: 'project-a'},
  media: [/* unchanged */],
}
```

The `_ref`, item `_key`, media, and layout fields are preserved. Strong references prevent deletion of a referenced target until the relationship is removed. That is a deliberate workflow change even though the frontend's reference shape is unchanged. Studio also uses temporary weak references with `_strengthenOnPublish` for draft targets; exclude those pending relationships from a blanket conversion and let the supported publishing workflow handle them.

A dry-run proposal can record the exact field to remove without performing a write:

```ts
// proposal is a review artifact, NOT a call to client.patch().commit().
const proposal = {
  documentId: document._id,
  expectedRevision: document._rev,
  targetId: entry.project._ref,
  operation: {
    type: 'unset',
    path: ['projects', {_key: entry._key}, 'project', '_weak'],
  },
}
```

Only propose this operation after confirming a normal, published `project` target exists, the reference is actually weak, and it is not awaiting `_strengthenOnPublish`. Skip missing, draft-only, malformed, and ambiguous targets for editorial review. Never guess a replacement target or mass-publish projects to satisfy a migration.

If strong references are not desired, retain weak references and add explicit publish-time existence validation instead. That requires no reference conversion, but it does not provide backend deletion protection after publication; a later deletion can still break the relationship. Decide which behavior is wanted before executing step 5B. The validation-only option belongs to step 5A.

**Data impact:** a targeted data migration of existing references if this option is chosen. No field renaming or document redesign is required. This changes deletion/publishing constraints, so it must remain separate from section A.

## C. Existing-content cleanup that may be needed

These are conditional content writes, not prerequisites for every code fix and not proof that a structural migration is necessary. A few entries may be corrected manually; a larger batch would need reviewed patches and a dry run. Do not combine them with routine UI changes.

### C1. Review the 13 All Projects media-membership mismatches — related to step 4

The [dry-run report](VALIDATION_DRY_RUN_REPORT.md) identifies 9million (2), Hablot (1), Charlotte Cardin (1), and SSENSE (9). Every asset and destination exists. The question is whether overview media must also appear in the selected project's slides.

- [ ] Review the selections for editorial intent.
- [ ] If independent overview media is intended, adjust the policy and keep those selections; no content repair is required.
- [ ] If strict membership is intended, choose the correct replacements or deliberately add the intended media to the project's slides. Do not infer which choice is correct from the asset IDs.
- [ ] Re-run validation before promoting membership warnings to errors.

**Complete when:** the policy and each affected selection are resolved. This is editorial cleanup if changes are needed, not an automatic migration.

### C2. Repair missing assets or destinations if later found — related to step 5A

The current dry run found none. No cleanup is presently indicated for these checks.

- [ ] Recheck immediately before enforcement because content may have changed.
- [ ] If failures appear, repair or remove only the affected selections with a known intended replacement.
- [ ] Revalidate the containing documents before publication.

**Complete when:** affected entries, if any, are valid. Keep these corrections independent of the weak-to-strong migration in section B.

### C3. Recalculate stored row settings only where necessary — related to step 10

The dry run did not audit row-setting consistency. The shared calculation and granular-patching fix belongs to section A; rewriting already-saved settings is separate.

- [ ] Compare saved settings with the intended desktop/mobile visible-media lists.
- [ ] Preserve valid authored row widths; do not reset every layout to defaults.
- [ ] Preview exact before/after settings for affected documents and check the frontend result before a backfill.

**Complete when:** any approved backfill changes only inconsistent values and retains the `number[]` representation. No structural migration is needed.

### C4. Resolve existing duplicate singleton documents only if found — related to step 13

Creation-menu protection belongs to section A. Existing duplicates were not audited by the validation dry run.

- [ ] Inventory duplicates and references to them.
- [ ] Identify the authoritative content and retain the canonical fixed IDs.
- [ ] Prepare any necessary merge, reference remapping, or deletion as a separately reviewed content change.

**Complete when:** any approved cleanup preserves intended content and references. Do not delete duplicates solely because their IDs differ from the canonical IDs.

## D. Verification and rollout

### 16. Run end-to-end acceptance checks and prepare delivery

- [ ] Run TypeScript, lint, and the production build.
- [ ] Add focused regression checks for the actual failures: request races, retry behavior, schema validation, media membership, read-only patch suppression, mobile row consistency, and independent concurrent edits.
- [ ] In a non-production Studio environment, exercise complete editing journeys: create a project, add media, configure both layouts, select it in All Projects, replace its project reference, remove source media, and test publication validation.
- [ ] Repeat the keyboard, narrow-screen, and processing-video checks in the live interface.
- [ ] Confirm that existing valid content still works and that new validation errors have a practical correction path.
- [ ] Deliver a summary of implemented changes, verified behavior, remaining limitations, and any separately proposed content repairs.
- [ ] Keep deployment and production content changes as distinct steps from completing the code review and tests.

**Complete when:** the reproducible defects have regression coverage, the agreed UX behaviors work in Studio, existing valid content remains usable, and no unexplained lint, runtime, or validation failures remain.

**Example: a regression test that makes the request race observable.**

```tsx
// Proposed test helper: fetchFor(projectId) returns a controlled promise.
// createProjectLoaderHarness supplies a mocked Studio client and provider.
const {wrapper, resolveProject} = createProjectLoaderHarness()
const {result, rerender} = renderHook(
  ({id}) => useProjectSlides({_ref: id}),
  {initialProps: {id: 'A'}, wrapper},
)
rerender({id: 'B'})
await act(async () => resolveProject('B', {slides: [{_key: 'slide-b'}]}))
await act(async () => resolveProject('A', {slides: [{_key: 'slide-a'}]}))
expect(result.current.slides.map(slide => slide._key)).toEqual(['slide-b'])
```

The harness is proposed test infrastructure, not an existing repository helper. Its transport should still permit A's late completion, so the test verifies response guarding even when cancellation is ineffective. Also validate full documents through Sanity's validator with a valid schema and negative controls; testing only a copied validation expression is insufficient.

```sh
# Existing local tools/scripts, after dependencies are installed.
./node_modules/.bin/tsc --noEmit --incremental false
./node_modules/.bin/eslint .
npm run build
```

No test script currently exists in package.json; configure and document the chosen focused test runner during implementation. These checks do not publish the Studio or mutate CMS content.

**Data impact:** tests use controlled fixtures or a non-production dataset, not production edits.

### Order for deploying validation or repairing existing content

1. Run the read-only inventory against both draft and published documents. Do not infer that production contains invalid data merely because test fixtures reproduce the bug.
2. Export affected documents and retain their IDs, revisions, and original values. Inspect the website's consuming queries and layout behavior.
3. Test the new validation on the inventory before enforcing it in the editors' Studio. Identify exactly which existing documents would be blocked from republishing.
4. Prepare targeted repairs or reference-conversion proposals. Preserve unrelated values, `_key` identities, and canonical singleton IDs. Review published and draft versions separately so an old draft cannot reintroduce a repaired problem.
5. Dry-run and review those proposals in a non-production environment. For Sanity migrations, [the CLI supports dry runs](https://www.sanity.io/docs/content-lake/schema-and-content-migrations).
6. When the content change is authorized, recheck target existence and document revisions before each write; stop and re-evaluate conflicts instead of overwriting newer edits. Coordinate the strong-reference schema change with the conversion so the old Studio does not continue creating permanent weak references.
7. Revalidate content, inspect representative frontend pages, and confirm editors can publish valid documents. Content writes to published documents can affect the website immediately; saving a draft does not deploy the same change publicly.
8. Keep the original-value report for a scoped rollback if needed. Reverting Studio code alone does not undo a data migration, and a rollback must not overwrite subsequent edits.

Stricter Studio validation does not automatically unpublish or rewrite existing published documents. It can stop the next publication until the problem is corrected. This is why the inventory and repair plan precede enforcing new rules.

## Migration and compatibility assessment

**The proposed fixes do not require a broad content-structure migration.** No field rename, document-type rename, reference-to-embedded-object conversion, new required stored field, or change from numeric row arrays to object arrays is planned. Preserve the shapes consumed by the website. Because the frontend has not been reviewed in this audit, verify its reference resolution and layout fallbacks before claiming full compatibility.

A migration changes existing stored documents. A validation change can block future publishing without changing stored data. A UI change can affect future edits without requiring old documents to be rewritten. Those are different kinds of impact.

| Steps | Structure or workflow impact | Migration or cleanup needed? |
| --- | --- | --- |
| 1–3: audit, loading, draft-first reads | No stored shape change; editors see the current draft | No |
| 4: project/media membership | Advisory warnings first; hard enforcement awaits the editorial decision | No migration for the warning; possible content correction in section C |
| 5A: require real assets | Existing empty wrappers or missing assets become invalid | Repair affected entries; no format conversion |
| 5B: weak → strong project references | Same `_ref` shape; different referential-integrity and publishing/deletion rules | **Targeted migration of existing `_weak: true` references if this option is chosen** |
| 6–9: picker options, previews, aspect ratios, read-only | Component behavior only | No; deduplicate options, never stored slides |
| 10: mobile row calculation and granular patches | Keep `rowSettings: number[]`; saved values may be inconsistent | Optional reviewed recalculation/backfill for affected documents |
| 11: grid anchors and preset scope | Saved layout shape unchanged; future preset actions may change behavior | No; do not rewrite existing layouts |
| 12: standalone tools | UI capabilities or labels change | No |
| 13: singleton creation | New duplicates prevented; canonical IDs retained | No for prevention; existing duplicates may need reviewed merge/remap/delete work |
| 14–16: accessibility, responsive CSS, verification | No content shape changes | No |

## Audit coverage

| Audit finding or follow-up risk | Plan steps |
| --- | --- |
| 1. Project-switch request race and stale state after clearing | 2 |
| 2. Existing media remains associated with a newly selected project | 4 |
| 3. Empty image/video objects pass validation | 5A |
| 4. Deleted project references pass validation | 5A; optional 5B |
| 5. Draft selection is unreliable and project media goes stale | 3 |
| 6. Project-fetch errors are unhandled and loading appears empty | 2, 6 |
| 7. Preview failures are swallowed and old thumbnails remain visible | 7 |
| 8. Picker availability counts the wrong media type | 6 |
| 9. Asset deduplication fails | 6 |
| 10. Custom controls ignore read-only state | 9 |
| 11. Mobile row settings count hidden media | 10 |
| 12. Grid anchors survive device/orientation changes | 11 |
| 13. Concurrent row edits overwrite one another | 10 |
| 14. Asset tools are labelled read-only without enforcing it | 12 |
| 15. Singleton types remain in creation menus | 13 |
| 16. Video layout previews use square crops | 8 |
| 17. Custom controls lack accessible names, semantics, and focus integration | 14 |
| Auto Layout changes both devices and forces landscape without clear disclosure | 11 |
| Fixed slide-planner sidebar may fail at narrow widths | 15 |
| Media-input CSS depends on fragile positional selectors | 15 |

## Initial production validation dry run — 2026-11-05

A read-only comparison has now been completed: [detailed report](VALIDATION_DRY_RUN_REPORT.md). Across 15 project/All Projects documents (including two drafts), current validation produced no markers. Candidate validation identified 13 media-membership failures in the published All Projects document: 9million (2), Hablot (1), Charlotte Cardin (1), and SSENSE (9). The assets exist, and missing-asset/missing-project checks found no affected content.

**Step 4 decision update:** do not introduce hard membership enforcement until those selections are reviewed for editorial intent. Prefer a visible warning during that review. If independent overview media is intentional, revise the membership policy rather than automatically deleting or replacing content. This is a proposed rollout adjustment based on observed data, not an applied schema change.

The dry run used candidate schemas in memory and Studio-equivalent validation against a frozen content/reference snapshot. It did not apply code changes, publish content, or convert references. See the report for exact field paths, version-specific CLI severity behavior, and limits. The historical audit baseline below describes the earlier source-only review; this subsequent read-only check did inspect production content.

## Verification baseline from the audit

- All custom components, related hooks/utilities, schemas, and Studio configuration were reviewed.
- Checks used a temporary review copy with the locked dependencies; the CMS checkout was unchanged by the audit.
- TypeScript passed.
- ESLint reported one warning: `mediaType` is missing from the preview effect dependency list.
- Isolated React checks reproduced the state-management defects using controlled requests and mocked Studio/UI boundaries.
- Actual Sanity document validation accepted empty image/video objects and a deleted project reference. Negative controls correctly rejected a missing project field and missing image field.
- The authenticated Studio was not exercised visually, and production documents were not inspected. Those remain explicit verification tasks in this plan.
