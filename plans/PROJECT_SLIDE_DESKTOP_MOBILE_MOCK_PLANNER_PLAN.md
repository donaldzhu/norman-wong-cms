# Project slide mock planner — desktop and mobile

Date: 2026-11-05  
Status: Implemented locally after explicit authorization; browser verification remains blocked.  
Repository: `norman-wong-cms`  
Scope: Local, temporary-state planner; no deployment, migration, or content writes.

Next revision: [Slide planner view and sizing revision](./SLIDE_PLANNER_VIEW_AND_SIZING_REVISION_PLAN.md) supersedes the combined settings layout, Auto preview access, and desktop height containment below. This revision is planned, not implemented.

## 1. Objective and relationship to existing plans

Extend the existing experimental planner with mobile Auto/manual controls and an orientation-aware preview that follows the newly implemented local frontend flex layout. Keep the original grid planner available.

This is the next phase of [DESKTOP_MOCK_SLIDE_PLANNER_PLAN.md](./DESKTOP_MOCK_SLIDE_PLANNER_PLAN.md). It supersedes that plan's desktop-only scope and dialog title, while retaining its six desktop buttons, strict authoring budget, top preview, and temporary-state isolation. The original plan remains a record of the implemented desktop mock.

The corresponding frontend contract is [PROJECT_SLIDE_FLEX_DESKTOP_MOBILE_PLAN.md](../../norman-wong-svelte/plans/PROJECT_SLIDE_FLEX_DESKTOP_MOBILE_PLAN.md). The current implementation, rather than the frontend plan's historical “current gaps” section, is the geometry reference.

The user explicitly authorized implementation after this plan was written. Local implementation results are recorded below.

## 2. Review of the current implementation

| Area inspected | Current behavior | Required CMS extension |
| --- | --- | --- |
| Frontend `src/lib/utils/projectSlideLayout.ts` | Shared axis-aware geometry; desktop 24 tracks, mobile 12; Auto halves resolved desktop spans; custom mobile spans retained | Match span resolution, Auto inference, gutters, containment, and orientation |
| Frontend `src/routes/_components/projectSlides/projectSlide.svelte` | Centered flex row or mobile Portrait column; measured viewport; no grid placement | Preview the same composition at fixed reference viewports |
| CMS `utils/projectSlideMockLayout.ts` | Desktop-only sizes, budget, initialization, and geometry | Separate state resolution/validation from shared desktop/mobile geometry |
| CMS `projectSlideMockDialog.tsx` | Local desktop state; signature and metadata requests cover desktop fields/assets only | Add mobile state, complete snapshot/signature, and mobile asset resolution |
| CMS `projectSlideMockPreview.tsx` | Noninteractive top preview, 1280 × 720, desktop images/posters | Add Desktop/Mobile selection, mobile reference, and row/stack support |
| CMS `projectSlideGridButton.tsx` | Development-only mock entry point; real planner remains separate | Rename experimental entry point; preserve isolation |
| CMS slide schema | Existing orientation and mobile span fields; schema initial orientation is Portrait | Read existing values only; do not add fields or change validation |

### Review findings that affect the design

1. **Auto is inferred, not stored.** The frontend treats all-absent mobile lines or a whole slide matching the old Center span defaults as Auto. A mix of defaults, custom values, and missing values is not Auto. The CMS must make the same initial decision.
2. **Custom mobile values can fall outside the six new buttons.** A valid stored span such as 10 must not silently become 8. Preserve it as a conditional existing-value selection until explicitly replaced.
3. **Authoring and compatibility rendering intentionally differ.** The frontend can fit legacy invalid content to keep it visible. The mock must reject invalid authoring totals and suppress that preview. Its stricter desktop initialization also requires an explicit selection for unsupported values and multi-item span 24.
4. **Missing orientation has inconsistent defaults across existing code.** The CMS schema initializes new slides to Portrait, but the frontend stacks only an explicit `portrait`; absent or unknown values render horizontally. Initialize the mock from the actual source value and frontend behavior, not the schema's initial-value rule.
5. **Mobile asset type switching is not implemented by the frontend renderer.** It selects a same-type mobile image/video override based on desktop `mediaType`. The mock must match that behavior rather than promise cross-type replacement support.
6. **The budget guarantee is narrow.** A valid desktop total halves into a valid Auto mobile total. It does not guarantee valid assets, valid source data, or no containment scaling. The UI must not silently hide those independent errors.

## 3. Scope and boundaries

### Included

- Extend the existing mock dialog; do not create a competing third planner.
- Keep the preview first, with Desktop/Mobile selection.
- Keep desktop Center/Justify and six buttons.
- Add a mobile section below all desktop controls.
- Add **Auto layout for mobile**, enabled for inferred defaults/new unset layouts.
- Hide manual mobile mode and size controls while Auto is on.
- Keep the mobile orientation dropdown visible in both modes.
- Support manual mobile Center/Justify and six size buttons.
- Preview real existing assets using read-only metadata requests.
- Add focused state/geometry checks and local browser verification.

### Excluded

- No saved temporary fields, schema additions, patches, migrations, or dataset changes.
- No Save/Apply operation, frontend integration of mock state, or publication blockers.
- No changes to the existing planner or its patch-producing preset helpers.
- No media upload, replacement, deletion, or reordering through the mock.
- No frontend code changes, Git push, or deployment.
- No local/session storage persistence; close discards the experiment.

The local Studio connects to the production dataset. Local component state is the chosen mock mechanism; adding a temporary Sanity field would not provide the same isolation.

## 4. Interface

Rename the development-only entry point to **Try new slide planner** and the dialog title to **Slide planner · mock**.

Vertical order:

1. Desktop / Mobile preview selector and the noninteractive preview canvas.
2. Desktop controls: Center/Justify, compact budget, media cards with the existing six buttons beneath each thumbnail.
3. Mobile section: **Auto layout for mobile** switch and **Mobile orientation** dropdown.
4. Manual mobile controls, visible only when Auto is off: Center/Justify, budget, media cards with mobile buttons beneath each thumbnail.
5. Reset and Close.

Open on Desktop preview. Preview selection changes only the displayed reference canvas; it does not change layout settings or hide either control section. Desktop/mobile edits update the corresponding preview immediately. Do not unexpectedly switch preview tabs when a size or orientation is changed.

Orientation options are **Portrait** and **Landscape**, retaining stored enum values. Portrait means a vertical stack; Landscape means a horizontal row. The dropdown controls arrangement, not device rotation. It remains visible even for Auto and single-media Justify, preserving the setting for later mode changes.

Use six pressed-state buttons, no numeric/text size inputs, no drag handles, and no clickable preview grid. Keep all size options selectable so temporary over-budget states can be corrected. Use keyboard-operable labeled controls, `aria-pressed` for size buttons, proper switch semantics, and `type="button"` inside the Studio form.

Keep wording minimal: section labels, functional controls, compact budgets, and conditional errors only. Do not restore reminder banners, size legends, resolution captions, or per-item maximum explanations. Preserve the accessible hover/focus tooltip for unavailable Justify. A selected size cannot toggle itself off.

## 5. Sizes and budgets

| Label | Desktop span | Mobile span, Auto or new manual selection |
| --- | --- | --- |
| XS | 6 | 3 |
| S | 8 | 4 |
| M | 10 | 5 |
| L | 12 | 6 |
| XL | 14 | 7 |
| XXL | 16 | 8 |

Button text includes the relevant count, e.g. **M (10)** on desktop and **M (5)** on mobile. Odd mobile spans are intentional. Do not reintroduce the earlier four-even-size proposal.

Desktop Center has a maximum total of 24; mobile Center has a maximum total of 12, in either orientation. Sum spans only: inter-media gutters do not consume additional column-budget units. Individual source line pairs must be integers in range, with end greater than start: desktop lines 1–25; mobile lines 1–13.

Auto uses the current mock desktop selections after consolidation, never the original raw spans:

- Desktop 4 → 6 → mobile 3.
- Desktop 9 → 8 → mobile 4.
- Desktop 18 → 16 → mobile 8.
- Desktop 16 + 8 → mobile 8 + 4.
- Desktop 10 + 8 + 6 → mobile 5 + 4 + 3.
- Desktop 6 + 6 + 6 + 6 → mobile 3 + 3 + 3 + 3.

Thus `mobileTotal = desktopTotal / 2`. Desktop 26 produces mobile 13: both remain invalid. Missing desktop selections also invalidate Auto; do not invent fallback sizes in the authoring mock.

Manual mobile is independent of desktop sizing. Exactly 12 is valid; above 12 is invalid. For supported new sizes, the largest individual choice with all other items at XS is 8 for one/two items, 6 for three, and 3 for four. Keep these as validation rules rather than extra UI text.

## 6. Initialization and local state

### State ownership

Keep a read-only source snapshot, separate mutable mock state, and separately cached asset metadata. State should represent:

- Desktop mode and sizes keyed by media `_key`.
- Mobile Auto boolean.
- Mobile orientation.
- Retained manual mobile mode and per-media spans, including valid legacy values.
- Active preview: Desktop or Mobile.

Derive effective Auto mode/spans from current desktop state. Do not duplicate Auto spans in editable state. Keep manual values separately so switching Auto on and off cannot destroy them. Use stable slide identity and media keys; duplicate/missing media keys must produce an explicit unavailable state rather than editing the wrong item.

### Desktop initialization

Retain the implemented desktop mock consolidation and strictness. Single stored span 24 selects Justify and remembers XXL/16 for return to Center. Missing/malformed/unsupported desktop sizes, including multi-item span 24, require explicit size selections. Do not adopt the frontend's nearest-size compatibility fallback for authoring.

### Initial mobile Auto inference

For a nonempty slide, enable Auto if either:

1. Every media has both mobile line values absent; or
2. Every media has valid mobile lines and its span equals the old Center default for that media count:

| Media count | Existing Center mobile span per item |
| --- | --- |
| 1 | 8 |
| 2 | 6 |
| 3 | 4 |
| 4 | 3 |

Compare span lengths, not starting positions. Equal lengths at different positions still infer Auto, matching the frontend. This is a compatibility heuristic; it cannot distinguish a manually selected layout that happens to match the default. Do not invent a persisted Auto flag to resolve that ambiguity during this mock phase.

Otherwise initialize Auto off and retain valid custom mobile spans. Partially missing or malformed lines remain manual with a conditional error. Do not silently classify them as Auto or fill them with eight-column defaults. Empty media shows an empty state and is never a valid layout.

### Existing manual values

- Spans 3–8 select the matching mobile button.
- A valid single span 12 selects mobile Justify; remember mobile XXL/8 as its initial Center return size.
- Other valid stored spans remain exact. Show a conditional **Existing (10)** selection alongside the six standard buttons for a stored span 10; apply the same rule to any other valid nonstandard Center value encountered.
- This existing-value option is available only for that item's captured source span during this dialog session. It is not a new general-purpose size or number input. Keep it available when another size is chosen so the experiment can return to its starting value.
- Multiple items containing a span 12 remain Center and must satisfy the combined budget; they cannot become multi-item Justify.
- Missing or invalid source values have no selected size and require a deliberate choice. Never round a custom span to a standard button.

### Orientation initialization

Preserve explicit Portrait/Landscape. An unset orientation initializes the local preview/dropdown to Landscape, matching current frontend fallback; a schema-created new slide that already contains Portrait remains Portrait. For an unknown nonempty value, show one conditional invalid-orientation message and require a dropdown selection. No fallback or selection writes to the real document.

## 7. Transitions

| Action | Result |
| --- | --- |
| Change desktop size/mode with Auto on | Recompute mobile spans/mode immediately; preserve orientation |
| Change desktop size/mode with Auto off | Leave manual mobile mode/spans/orientation untouched |
| Turn Auto off for the first time on an inferred-Auto slide | Seed manual mode/spans from the current effective Auto layout; retain invalid/unselected state if desktop is invalid |
| Turn Auto on from manual | Retain the complete manual snapshot, derive effective mobile from desktop, hide manual controls |
| Turn Auto off after a previous manual session | Restore that manual snapshot exactly, including legacy sizes |
| Change orientation | Recompute row/stack geometry only; do not change spans, mode, or Auto |
| Switch Center to Justify | Allowed only for one item; retain Center sizes |
| Switch Justify back to Center | Restore retained Center sizes |
| Reset or Reload preview | Reinitialize both desktop/mobile and asset snapshot from latest source; return preview to Desktop |
| Close/reopen | Discard experiment; initialize from current source |

With Auto on, mobile Justify follows desktop Justify and manual mode controls are hidden. With Auto off, mobile mode is independent: desktop may be Center while mobile is Justify, or vice versa. Justify fills the entire reference slide using centered cover.

## 8. Validation and error presentation

Validate before geometry or containment. Keep budgets and source errors separate from asset readiness.

- Validate desktop independently; validate manual mobile independently. Auto mobile depends on valid desktop state.
- An invalid desktop must not prevent viewing a valid independent manual mobile composition, and an invalid manual mobile must not suppress a valid desktop preview.
- Show each section's compact total. In Auto, show a derived mobile total without per-item manual controls.
- For the selected preview, replace the canvas with its relevant error when invalid. Example: **14 / 12 columns** and **Reduce by 2 columns.** Do not show an old valid canvas or fitted invalid composition.
- Missing sizes show **Choose a size for each media item.** Auto with unresolved desktop selections shows **Choose desktop sizes to preview Auto mobile.**
- Source-change errors take precedence over rendering either snapshot as current. Then handle empty/invalid layout, then asset loading/unavailability.
- Keep controls available while invalid. Never normalize other items, wrap the composition, or shrink an invalid budget into apparent validity.
- Missing asset metadata must not remove that media from the order or budget. Show a loading/unavailable state instead of treating the frontend's compatibility-square fallback as an accurate preview.

These are mock-only errors; do not change document validation or block existing documents from publishing.

## 9. Preview geometry and assets

### Reference viewports

Use desktop **1280 × 720** and mobile **390 × 844** as explicit reference slide dimensions. Mobile arrangement switches inside the same reference viewport; it does not rotate the canvas. The frontend breakpoint is mobile at 768px and below, desktop above 768px; CMS reference selection is explicit, not based on the dialog's width.

Scale the entire selected canvas uniformly to fit the available width and the existing approximately 40vh height cap. Center it in the preview area. Recalculate display scale on reference selection, host resize, and window resize. Scale gutters with the canvas rather than recalculating geometry against the narrow CMS panel.

Use the frontend's reference gutter, currently 20px for the desktop reference. Its stylesheet token is `--project-slide-gap: 2rem`; verify the computed gutter at both reference sizes when implementing and record the constants in parity fixtures. Do not inherit the old CMS grid's 8px gutter or assume Studio's own rem size matches the website.

### Shared formula

Let `V` be the main-axis slide extent (width for a row, height for a stack), `N` be 24 desktop/12 mobile, and `G` be the resolved gutter. Retain the frontend's 8px sizing buffer:

```text
C = V + 8
T = (C - (N - 1) × G) / N
extent(S) = S × T + (S - 1) × G
```

Two tracks mean `2T + G`, not a fraction of the viewport. At desktop V=1280 and G=20, T=34.5 and span 8 is 416px before containment.

- Horizontal: calculated extent is width; height is width / asset aspect ratio.
- Vertical: calculated extent is height; width is height × asset aspect ratio.
- Center the complete group on both axes, in original media order, with one equal resolved gutter between adjacent items.
- Use flex without wrapping or implicit shrinking; dimensions come from geometry.
- Match the frontend's narrow-viewport gutter cap before track calculation and use the resolved gap consistently for sizing and placement.
- For a valid composition, reserve inter-item gaps, then apply a common scale of at most 1 to media dimensions when needed to fit either axis. Keep the gaps at the resolved gap; scale all media equally.
- The 8px buffer can cause a small boundary fit for a full-budget composition. Distinguish this from invalid span totals. Return scale/fit reason in geometry for tests; do not add technical diagnostics to the normal UI.
- Justify bypasses Center geometry and covers the actual slide dimensions with one item.

Port the small pure geometry contract into the CMS helper and verify it against frontend fixtures. Do not import source from the sibling repository at runtime or couple their build systems. Do not change frontend code during CMS implementation.

### Effective assets

Resolve desktop and mobile assets separately from the same source snapshot. For mobile, follow the actual frontend same-type rule: image media uses `mobileImage ?? image`; video media uses `mobileVideo ?? video`. Do not use `mobileMediaType` alone to switch renderer types. Record cross-type divergence as a review limitation, not a new behavior to fix in this task.

Fetch the union of needed asset references once per snapshot, deduplicated, through the existing read-only client. Cache by asset reference but associate each rendered placement with its media `_key`. Preserve source aspect ratios in images and Mux posters; no square poster crop. Poster previews are sufficient; no video playback work is required.

If an override exists but its asset is missing/broken, show the unavailable state rather than silently selecting a different asset. Request failure, missing dimensions, and image/poster load failure must be recoverable through reset/reload. Late responses must not update a closed, reset, or different slide's preview.

## 10. Snapshot and content isolation

Extend the relevant source signature to include slide orientation, media keys/order/types, desktop/mobile lines, and desktop/mobile asset references. Include any crop/hotspot properties actually consumed by preview URL generation. Keep `mobileMediaType` in the signature even though renderer parity follows the desktop type.

Capture the relevant source fields into a separate snapshot; never mutate incoming Sanity form values. If source values change underneath an open mock, show **Slide changed — reload preview** and require explicit reload/reset. Do not merge remote changes into experimental choices. Stable slide identity must prevent state leaking across projects/slides.

Continue passing only read-only source values and an onClose callback into the mock. Do not pass the document's `onChange` or call Sanity patch/mutation APIs, old auto-layout helpers, or schema-bound inputs. All new controls update local state only.

## 11. File-level implementation sequence

1. **Review baseline:** inspect working-tree changes and frontend resolver/constants again. Preserve unrelated work. Confirm this plan has explicit implementation authorization.
2. **Pure state rules — `utils/projectSlideMockLayout.ts`:** add mobile sizes, line validation, Auto inference, legacy manual-value retention, effective-layout resolution, independent budgets, and explicit transitions. Keep existing desktop consolidation.
3. **Geometry — same helper or one small adjacent helper:** parameterize tracks, axis, viewport, gap, and ratios; retain strict validation outside the geometry function; add frontend parity fixtures.
4. **Dialog — `components/projectSlide/projectSlideMockDialog.tsx`:** extend snapshot/signature, retain manual state across Auto toggles, add the mobile section/orientation dropdown, and resolve both asset sets with read-only requests.
5. **Preview — `components/projectSlide/projectSlideMockPreview.tsx`:** accept the selected resolved layout and viewport, support row/stack and cover, react to reference changes, and preserve loading/error behavior and noninteractivity.
6. **Entry point — `components/projectSlide/projectSlideGridButton.tsx`:** update the mock label only; preserve its development guard and the existing planner.
7. **Verification:** run focused checks, TypeScript, local build, and browser checks. Capture desktop and mobile diptych screenshots, including a stacked mobile view. Update this plan's status with actual results and limitations.

No schema changes are needed. Existing `components/types/media.ts` already exposes mobile fields; add only mock-local types if needed. Keep the new UI inside the existing experimental components.

## 12. Verification and acceptance criteria

### State and validation fixtures

- [ ] Desktop consolidation 4→6, 9→8, 18→16 and single 24→Justify remain unchanged.
- [ ] All six Auto mappings preserve exact halves, including 3, 5, 7.
- [ ] Enumerate supported desktop combinations for one to four items: every valid total maps to mobile ≤12; invalid totals never become valid through fitting.
- [ ] All-absent and all-default mobile lines initialize Auto; custom and partially absent/malformed lines do not.
- [ ] Shifted valid line pairs with default span lengths still infer Auto.
- [ ] Stored custom span 10 stays 10 with its conditional existing-value selection; no silent rounding.
- [ ] Manual single 12 is Justify; multi-item Justify is unavailable.
- [ ] Manual values survive Auto on/off, desktop edits, and Center/Justify toggles.
- [ ] Orientation stays unchanged through Auto/mode changes; absent and unknown orientation follow the documented distinct rules.
- [ ] Invalid desktop only blocks Auto-dependent mobile, not valid manual mobile; manual errors do not block desktop preview.
- [ ] Empty media, missing sizes/keys, malformed lines, and over-budget states are explicit.

### Geometry and asset fixtures

- [ ] Two tracks equal 2T+G; desktop span 8 retains the 416px reference result before fitting.
- [ ] Compare CMS/frontend results at identical desktop/mobile viewports, gaps, spans, and aspect ratios within numerical tolerance.
- [ ] Exercise horizontal and vertical one-to-four-item fixtures, odd spans, full budgets, mixed portrait/landscape media, and narrow-viewport gap adjustment.
- [ ] Group centering, equal gaps, common containment scale, and aspect ratios match the frontend.
- [ ] Single Justify covers both dimensions; orientation does not distort it.
- [ ] Mobile same-type replacements use their own aspect ratios and posters; missing overrides do not silently fall back.
- [ ] Metadata/poster failures remain explicit; stale async responses cannot overwrite current assets.

### Local Studio and isolation

- [ ] Top Desktop/Mobile preview selection and lower mobile section are reachable on a laptop-sized window without horizontal overflow.
- [ ] Auto starts on for default layouts and hides manual controls while preserving the orientation dropdown.
- [ ] Manual six-button groups and conditional existing-value options work with mouse and keyboard; no numeric inputs appear.
- [ ] Disabled Justify explains itself on hover/focus; invalid selected-preview errors replace the canvas once.
- [ ] Source changes, reset, close/reopen, and switching slides do not leak or overwrite temporary state.
- [ ] Focused callback/request checks confirm zero mock-originated Sanity mutations for all controls and lifecycle actions.
- [ ] The original planner remains present and unchanged; do not edit live content merely to test it.
- [ ] Run `npx tsc --noEmit --incremental false` and `npm run build`; distinguish existing failures from regressions. These checks are for implementation, not required for this documentation-only task.
- [ ] Capture a real existing diptych in Desktop, Mobile Auto, and Mobile Portrait views. Use local fixture data or mock controls for unavailable cases; do not create test documents in the dataset.
- [ ] Review final diff for unintended frontend/schema/content-writing changes and report no deployment/migration.

## 13. Completion, rollback, and later adoption

Implementation is complete when the local mock faithfully demonstrates the frontend contract for valid layouts, preserves existing custom mobile values, rejects invalid authoring budgets, and has verified zero content writes. Closeout should link the plan and show the requested preview evidence, with any unverified cases stated plainly.

Rollback is reverting this mobile extension to the existing desktop mock; no dataset restoration is needed. A later persisted planner requires a separate plan for explicit saved Auto/manual semantics, frontend consumption, patch behavior, legacy compatibility, and eventual old-planner retirement. None of those decisions is part of this temporary-state phase.

## Local implementation results

- Added mobile Auto/manual controls, orientation dropdown, six mobile buttons, conditional legacy-size choices, and Desktop/Mobile preview selection to the existing temporary-state dialog.
- Mobile asset resolution follows frontend same-type overrides; geometry supports rows and vertical stacks. Independent budgets suppress invalid previews.
- TypeScript check and local production build passed. The build required network access to resolve Sanity’s configured auto-update package; nothing was deployed.
- `node tests/projectSlideMockLayout.test.mjs` passed initialization, custom-span preservation, budget checks across 1,554 combinations, and numerical frontend parity for valid horizontal/stacked compositions.
- Source review confirms the mock accepts no document mutation callback and uses only read-only client fetches. No schema, migration, or frontend source changes were made.
- Browser interaction/screenshot verification remains incomplete: Chrome automation was blocked by an open extension UI; the alternate in-app browser reached the Studio login screen and had no authenticated session. No screenshot of the new controls is claimed. Auto-toggle interaction, focus behavior, source-change lifecycle, and request-level mutation monitoring still require a local browser pass.
