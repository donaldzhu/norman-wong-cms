# Desktop Mock Slide Planner Plan

Date: 2026-11-05  
Status: Mock and UI revision implemented locally on 2026-11-05; not deployed.  
Repository: `norman-wong-cms`

Next phase: [Project slide desktop/mobile mock planner](./PROJECT_SLIDE_DESKTOP_MOBILE_MOCK_PLANNER_PLAN.md) extends this implemented desktop mock with mobile Auto/manual controls and frontend flex-preview parity. That plan supersedes the desktop-only boundary for the proposed next phase; it is implemented locally, with browser verification limitations recorded there.

This document describes the desktop-only experimental slide planner alongside the existing planner. The initial mock was implemented locally without deployment or data migration. The current revision moves the preview to the top, replaces numeric inputs with six size buttons beneath each media thumbnail, and removes repeated explanatory text. The user subsequently authorized and received this UI revision locally.

## 1. Objective

Provide a working mock of the simplified Center/Justify editor so its controls, column limits, and preview can be evaluated before adopting a new content model.

The experiment must preserve the existing planner and use the current slide's media without saving experimental settings to Sanity. Centered sizes remain actual column spans of the existing 24-column desktop grid.

## 2. Decisions and scope

### Chosen mock approach

Use temporary React component state inside a separate dialog. Do not introduce temporary Sanity fields for this phase.

This approach is appropriate because the local Studio connects to the production dataset. A temporary schema field would still become production content if saved. A local-state mock can read current media and display proposed layouts without writing document patches.

### In scope

- A second button beside the existing slide planner entry point.
- A separate desktop-only dialog with Center/Justify controls.
- Six named size buttons beneath each media thumbnail, with column counts in their labels.
- A strict 24-column total limit for centered layouts.
- A scaled, non-interactive preview at the top of the dialog.
- Read-only loading of existing image/video metadata and preview assets.
- Local reset and close behavior.
- Focused verification of layout rules, preview geometry, and isolation from content writes.

### Out of scope

- No migration, backfill, cleanup, or other production-content write.
- No temporary or permanent schema fields.
- No replacement or removal of the existing planner.
- No new document-level validation or publication blockers.
- No mobile controls, mobile sizing changes, or mobile field updates.
- No changes to the Svelte frontend in this phase.
- No asset uploads, media selection changes, deletion, or reordering through the mock.
- No Save, Apply, Publish, or Apply-to-old-planner operation.
- No push or deployment.

The old planner remains the existing editing tool. The new planner is a preview-only experiment.

## 3. Current integration points

| Existing file | Relevant behavior |
| --- | --- |
| `components/projectSlide/projectSlideGridButton.tsx` | Renders the existing planner button, its dialog, and the default slide fields. Add the experimental entry point here without replacing the old one. |
| `components/projectSlide/projectSlideGridDialog.tsx` | Existing planner calls Sanity `onChange` with patches. Preserve its behavior; do not use this editing path for the mock. |
| `utils/projectSlideAutoLayout.ts` | Existing presets write desktop and mobile positions and reset mobile orientation. Do not call this patch builder from the mock. |
| `components/projectSlide/configs.ts` | Existing CMS grid uses 24 desktop columns and an 8px preview gap. The new preview must use the frontend's reference geometry rather than inherit the old preview gap. |
| `components/previews/mediaRefPreview.tsx` | Existing video posters are requested as square crops. Reusing this output unchanged would misrepresent video proportions. |
| `components/types/media.ts` | Supplies media keys, references, and stored desktop spans. Treat these inputs as read-only. |
| `schemaTypes/objects/projectSlide/projectSlide.ts` | Existing media array permits one to four items. Keep its schema and validation unchanged. |
| `sanity.config.ts` | Local Studio targets the production dataset. Mock operations must not emit content writes. |

Other plans and unrelated working-tree changes are independent of this work and must be preserved.

## 4. Entry point and dialog layout

Keep the existing **Open slide grid planner** button and add **Try new desktop planner** beneath it. Initially expose the new button only in the local development Studio.

The revised dialog uses a vertical stack:

1. Dialog title: **Desktop planner · mock**.
2. Desktop preview as the first content block, above all editing controls.
3. Center / Justify mode control and a compact centered-layout budget, such as **16 / 24 columns**.
4. Existing media cards in array order. Each card shows its thumbnail and short identifier, with the six size buttons directly underneath in Center mode.
5. Reset and Close buttons.

Keep the preview proportional at 16:9. Scale the entire reference canvas to fit both the dialog width and a practical height cap (approximately 40vh), centered within its area. This keeps the controls reachable without letting the preview consume the whole dialog. The source geometry remains 1280 × 720; only its display scale changes. Allow vertical scrolling for longer media lists. Let the size-button row wrap within a card if necessary without horizontal scrolling.

The preview has no clickable cells, drag handles, positioning controls, or grid overlay. All layout changes come from the mode and size buttons.

### Text reduction

Remove the yellow **Preview only — changes are not saved** banner, the **Layout** and **Project media** section labels, the reference-resolution caption, the size-to-column legend, repeated selected-size descriptions, per-media maximum guidance, the always-visible Justify explanation, and the general reminder that totals cannot exceed 24. The word **mock** in the dialog title is sufficient to identify the experiment.

Keep functional labels, the compact column total, and messages shown only when needed: an over-budget layout, an unselected size, unavailable media, loading, or a changed source slide. Show each error once. For an overage, use **32 / 24 columns** beside the mode control and **Reduce by 8 columns** in the preview area; do not repeat the same explanation elsewhere.

Use ordinary local controls, not schema-bound Sanity field inputs that emit patches. Dialog buttons must not inadvertently submit the surrounding Studio form.

## 5. Temporary state and lifecycle

### Opening

- Read the current slide value from the existing Studio form so the mock reflects the current editing context.
- Copy the relevant desktop values and media references into temporary state.
- Identify media by `_key`, not array index or asset ID. Reused assets can appear in different placements.
- Identify the slide by its stable form path/slide key so settings cannot leak between slides or projects.
- Never mutate the incoming slide value or media objects.

### During editing

- Size and mode changes update local state only.
- Metadata requests are read-only, scoped to the current media references, and deduplicated where practical.
- Guard against stale responses when the dialog closes, resets, or changes source slide.
- Do not call the parent input's `onChange`, Sanity patch helpers, mutation endpoints, or the old auto-layout patch builder.
- Do not add persistence through local storage or session storage in the first version.

### Reset, close, and source changes

- Reset discards the experiment and initializes again from the latest current slide value.
- Close discards temporary settings. Reopening begins from the current slide again.
- If relevant underlying media, order, references, or desktop settings change while the dialog is open, show **Slide changed — reload preview**.
- Do not silently overwrite the experimental controls or merge incoming settings into them. A reload/reset action explicitly refreshes the snapshot.
- Switching projects or slides closes or reinitializes the mock under the new stable identity.

## 6. Size controls and initialization

### Six supported size buttons

| Button label | Column span |
| --- | --- |
| XS (6) | 6 |
| S (8) | 8 |
| M (10) | 10 |
| L (12) | 12 |
| XL (14) | 14 |
| XXL (16) | 16 |

Display all six buttons under each media thumbnail. Clicking one selects that size for that media only and immediately updates the preview and budget. Give the selected button a clear active style and `aria-pressed`; label each button group for its media item. Use ordinary buttons with `type="button"` so Enter/Space selects a size without submitting a surrounding form. There are no text fields, numeric fields, spinners, or number-typing controls.

Budget calculations sum column spans. Existing internal size identifiers may remain 1–6 to avoid unnecessary state changes; those identifiers are not shown in the UI.

Keep all six choices selectable, preserving the current mock's ability to show an invalid total while the user adjusts the composition. Do not introduce disabled size buttons or silently resize another item. Missing or unsupported source sizes begin with no selected button and remain invalid until a selection is made. A selected button does not toggle itself off when clicked again.

### Initialize from existing desktop spans

Derive each stored span from `desktopEnd - desktopStart`, then initialize the mock using the agreed consolidation:

| Stored span | Initial mock setting |
| --- | --- |
| 4 | XS (6) |
| 6 | XS (6) |
| 8 | S (8) |
| 9 | S (8) |
| 10 | M (10) |
| 12 | L (12) |
| 14 | XL (14) |
| 16 | XXL (16) |
| 18 | XXL (16) |
| 24 with exactly one item | Justify |

If a span is missing, malformed, unsupported, or is 24 on a multi-item slide, show that an explicit size selection is required. Do not invent a valid composition by silently reducing other items.

All consolidation is in-memory. Original positions and spans remain untouched.

If the consolidated values exceed 24 columns, open the dialog in an invalid state with the affected controls visible. Do not shrink the preview to conceal the invalid settings.

## 7. Column budget and maximums

### Core rule

For Center mode:

`totalColumns = sum(selected column spans)`

- Below 24: valid.
- Exactly 24: valid.
- Above 24: invalid.
- Any missing or invalid individual size: invalid.
- No media: show an empty state; no layout is valid.

The gutter is accounted for by the grid sizing calculation. Do not add an extra column to the budget for each gap between media.

### Examples

| Selected spans | Total | Result |
| --- | --- | --- |
| 16 + 8 | 24 | Valid |
| 12 + 12 | 24 | Valid |
| 10 + 8 + 6 | 24 | Valid |
| 8 + 8 + 8 | 24 | Valid |
| 6 + 6 + 6 + 6 | 24 | Valid |
| 14 + 12 | 26 | Invalid |
| 10 + 8 + 8 | 26 | Invalid |
| 16 + 16 | 32 | Invalid |

### Per-item maximum

For an item, calculate `availableColumns = 24 - sum(other selected spans)`.

Its largest currently valid choice is the largest supported column span that does not exceed `availableColumns`. If fewer than six columns remain, no supported size fits until another item is reduced.

With all other media at the minimum size of six columns:

| Media count | Largest possible individual span |
| --- | --- |
| 1 | 16 |
| 2 | 16 |
| 3 | 12 |
| 4 | 6 |

The actual available maximum can be lower depending on the other selections. With four items, all four must be XS / six columns. These calculations remain layout constraints; the revised interface does not display a separate maximum reminder under each media.

### Invalid-state behavior

- Show a continuously updated budget indicator, such as **22 / 24 columns**.
- For an overage, retain the compact budget and show **Reduce by 2 columns** once in the preview area.
- Allow temporary invalid combinations while the user selects individual size buttons.
- Do not silently change another item or display repeated maximum guidance.
- Replace the rendered preview with the validation message while invalid. Do not leave a stale valid preview visible without explanation.
- Never use scale-to-fit, clipping, wrapping, or automatic normalization to make a total above 24 appear valid.

This validation is local to the mock. It must not change the old planner's validation or block publishing existing documents.

The existing frontend still has defensive fitting behavior for saved content. This mock introduces the new authoring rule only; adopting that rule in saved content and the frontend is a later, separately authorized phase.

## 8. Center and Justify behavior

### Center

- Preview the selected actual column spans.
- Ignore old absolute starting positions for the proposed composition.
- Preserve the existing media order.
- Center the group with consistent visible gaps.
- Preserve image and video aspect ratios.
- Validate the column budget before calculating display geometry.
- For valid layouts, match the current frontend's containment behavior. Vertical containment is distinct from column-budget validation and cannot make an over-budget configuration valid.

### Justify

- Available only when exactly one media item is present.
- Disable it for multiple items and show the tooltip: **Justify is only available for slides with one media item.**
- Show the disabled explanation on hover and keyboard focus through an accessible tooltip wrapper; remove the permanent helper sentence.
- Hide the size-button groups and centered budget while Justify is active.
- Fill the preview slide in both dimensions using centered cover.
- Preserve the last selected centered size when switching to Justify and restore it when switching back.
- When opening directly from a stored single-item span of 24, initialize its return-to-Center size to XXL / 16 columns.
- Justify is a layout mode, not a seventh centered size.

## 9. Preview accuracy

### Reference viewport

Render the preview at a defined desktop reference viewport, **1280 × 720**, and scale the whole canvas down to fit the available dialog width and preview height cap. Keep the reference dimensions in the implementation; remove them from the visible caption.

Scale the media, gutters, and canvas together. Do not recompute column widths against the small CMS panel while leaving gutter pixels unscaled; that would distort the composition relative to the website.

Use the corrected frontend's grid-track-and-gutter sizing contract, including its legacy 8px width buffer as the column-sizing reference. At a 1280px viewport and a 20px gutter, the grid reference width is 1288px, the track width is 34.5px, and an eight-column span measures 416px before any legitimate height containment.

An eight-column setting must not become a direct one-third-viewport width.

The existing CMS preview's 8px gap must not be reused as an approximation of the frontend's current 20px reference gutter. Keep the preview's sizing constants explicit and verify them against the frontend.

### Asset handling

- Resolve the desktop asset for each existing media item.
- Read image dimensions and video aspect-ratio metadata without writing documents.
- Use image thumbnails and video posters with the source aspect ratio preserved.
- Do not reuse the current square-cropped video poster output for the new preview.
- Poster previews are sufficient for this mock; video playback is not required.
- Keep loading, missing-asset, and failed-request states explicit and recoverable.
- Do not silently omit an unavailable media item from the budget or array order.
- If proportions cannot yet be determined, show a labeled loading/unavailable state rather than claim an accurate rendered layout.

## 10. Revision implementation structure

The mock components already exist. Apply the UI revision to those components.

| Area | Proposed responsibility |
| --- | --- |
| Existing `projectSlideGridButton.tsx` | Preserve the existing development-only entry point and old planner |
| `components/projectSlide/projectSlideMockDialog.tsx` | Move the preview first; replace TextInput with labeled size buttons under each thumbnail; simplify text; add the hover/focus Justify explanation |
| `components/projectSlide/projectSlideMockPreview.tsx` | Fit the reference canvas within the new height cap as well as the available width, without changing layout geometry |
| `utils/projectSlideMockLayout.ts` | Add the six display labels alongside the existing size mapping if useful; preserve consolidation and total-budget rules |
| Existing metadata loading in the mock dialog | Preserve read-only loading and stale-response protection |

Keep the mock dialog's API read-only with respect to the real slide. Do not pass the parent document's mutation callback into it.

Separate validation from rendering. A renderer should receive a valid mock layout, not silently repair an invalid one. Keep parity with frontend column sizing through explicit numerical fixtures rather than coupling the two repositories' build systems during this experiment.

## 11. Implementation sequence

1. Confirm the current mock and unrelated working-tree changes before editing.
2. Move the preview above all controls and constrain its display height while retaining the reference canvas.
3. Replace numeric inputs with the six named buttons beneath each thumbnail and show selection accessibly.
4. Remove the specified reminders and duplicate labels; keep conditional errors and the compact budget.
5. Replace the permanent disabled-Justify explanation with an accessible hover/focus tooltip.
6. Verify button selection, over-budget rejection, mode switching, reset, and close/reopen using the local mock only.
7. Run TypeScript and the local build, review the diff, and capture a screenshot showing the top preview and size buttons together. Do not deploy.

No step requires production-content changes, a migration, a frontend modification, or deployment.

## 12. Verification and acceptance criteria

### Local state and isolation

- [ ] Opening the mock copies the current slide without modifying it.
- [ ] Size/mode changes, reset, close, and reopen emit zero Sanity patches or mutations.
- [ ] No temporary schema fields or persisted mock properties are added.
- [ ] Mock settings cannot leak between slides, projects, or reused assets.
- [ ] Source changes prompt an explicit reload instead of silently replacing local edits.
- [ ] Late metadata responses cannot affect a closed dialog or a different slide.
- [ ] The existing planner still opens and edits through its existing path.
- [ ] The old auto-layout patch builder is never called by the mock.

### Budget and modes

- [ ] All six size labels map to the correct column counts.
- [ ] Exactly 24 columns is valid for one-to-four-item supported combinations where applicable.
- [ ] Totals above 24 are invalid and cannot produce an apparently valid preview.
- [ ] Six buttons appear beneath each media thumbnail with the exact labels XS (6), S (8), M (10), L (12), XL (14), XXL (16).
- [ ] No numeric or text input remains for selecting sizes.
- [ ] Selection is visible and exposed to assistive technology; mouse and keyboard operate the buttons.
- [ ] Unsupported source sizes have no selected button until explicitly chosen.
- [ ] Four-item centered layouts accept only four six-column items.
- [ ] Justify is available only for one media item.
- [ ] The disabled Justify explanation is discoverable by mouse and keyboard.
- [ ] Switching modes restores the previous centered size.
- [ ] Consolidated source values that exceed the budget remain visibly invalid until adjusted.

### Preview

- [ ] The preview is the first content block above the controls, with no interactive positioning surface.
- [ ] The reference canvas scales within both width and height limits without clipping or changing its aspect ratio.
- [ ] The preview and size controls are comfortably reachable on a typical laptop viewport; button rows wrap without horizontal scrolling.
- [ ] Removed reminders and duplicate labels do not reappear; conditional errors are shown once.
- [ ] Size 8 columns at the reference viewport matches the 416px legacy-grid fixture before height containment.
- [ ] Resizing the dialog scales the entire reference canvas consistently.
- [ ] Centered layouts preserve aspect ratios, array order, and equal visible gaps.
- [ ] Justify fills the preview with cover.
- [ ] Video posters preserve actual source proportions.
- [ ] Missing/loading media is explicit and remains included in the item count and budget.
- [ ] One-, two-, three-, and four-item fixtures exercise both valid and invalid states without creating or editing Sanity content.

### Repository and browser checks

- [ ] Run the local TypeScript check, for example `npx tsc --noEmit --incremental false`, and record pre-existing errors separately.
- [ ] Run `npm run build` without deployment.
- [ ] Exercise the dialog in the local Studio with mouse and keyboard.
- [ ] Use callback spies or equivalent focused checks to prove mock actions do not invoke document-change handlers; inspect requests to confirm no mutation originates from the mock.
- [ ] Review the diff for unintended schema, mobile, frontend, or content-writing changes.

## 13. Completion and later adoption

This phase is complete when the mock can be evaluated with real existing slide media, the maximum rules behave predictably, and the experiment cannot save changes to the dataset.

Only after evaluating the mock should a separate plan define persisted fields, save/apply behavior, integration with the website, and eventual retirement of the old planner. Those decisions are not prerequisites for this experiment and are not authorized by this document.

Rollback is removal of the experimental entry point and its local components/helpers. No content restoration is needed because the mock saves nothing.

## Reference

- Sanity's custom-input patch model: https://www.sanity.io/docs/studio/from-input-components-to-real-time-safe-patches
