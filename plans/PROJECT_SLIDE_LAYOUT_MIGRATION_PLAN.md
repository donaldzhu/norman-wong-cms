# Project slide layout migration and adoption

Date: 2026-11-05  
Status: Production data backfill completed and verified after explicit authorization on 2026-11-05. CMS/frontend V2 adoption implemented locally; production code deployment remains pending.  
Owner repository: `norman-wong-cms`  
Related repository: `norman-wong-svelte`

## 1. Objective

Normalize legacy column spans into an explicit Center/Justify and mobile Auto/manual data model, then adopt that model in the CMS and frontend. Preserve original fields during the transition so migration can be reviewed and rolled back.

Start with the data contract and a read-only conversion report. Do not rewrite old start/end positions in place. The intended sequence is: define target → snapshot → dry run → review exceptions → authorize backfill → verify → authorize application cutover → retire legacy editing later.

The migration should preserve the interpretation of the corrected local frontend for valid supported content. It is not expected to reproduce every placement of the deployed legacy grid: centered positioning, desktop consolidation, mobile Auto inference, and Justify were already intentional changes. Report those differences separately from migration defects.

## 2. Current code and dependencies

Reviewed on the date above:

- Project documents contain `slides[]`, whose `media[]` entries hold desktop/mobile start/end lines, media keys, and asset references. Slide-level `mobileOrientation` is currently shared by the old planner and frontend.
- CMS schemas: `schemaTypes/objects/projectSlide/projectSlide.ts` and `projectSlideMedia.ts`.
- The old planner/preset helpers emit patches to legacy fields. `utils/projectSlide.ts` validates legacy lines and still powers document-level validation.
- The new planner is a development-only local-state mock with no save/mutation callback. It cannot currently persist a migration's new layout fields.
- The local frontend resolver consolidates desktop spans and infers mobile Auto from absent/default mobile spans. It does not read an explicit new layout model.
- The shared frontend slide query spreads slide/media fields, but types, resolution, and all consuming routes still need explicit review when introducing a new model.
- Legacy CMS mobile media-type selection and frontend same-type mobile overrides differ. This migration must preserve asset fields and report such cases, not alter media selection semantics incidentally.

Related decisions:

- [Desktop/mobile mock planner](./PROJECT_SLIDE_DESKTOP_MOBILE_MOCK_PLANNER_PLAN.md)
- [Current CMS interface revision](./SLIDE_PLANNER_VIEW_AND_SIZING_REVISION_PLAN.md)
- [Frontend flex contract](../../norman-wong-svelte/plans/PROJECT_SLIDE_FLEX_DESKTOP_MOBILE_PLAN.md)
- [Desktop width correction](../../norman-wong-svelte/plans/DESKTOP_COLUMN_WIDTH_CORRECTION_PLAN.md)

The latest user decisions take precedence over historical text in those plans: white preview; active-view settings; top-right Auto switch; Mobile disabled during Auto; orientation beneath mobile modes; no bottom Reset/Close; over-budget selections retain the last valid preview and show only `Layout exceeds max column size (24).` or `(12).`

## 3. Proposed target data contract

Names below are implementation proposals to finalize before generating patches. Store actual spans, not XS/XXL labels or button indices.

| Location | Proposed field | Meaning |
| --- | --- | --- |
| Slide | `layoutV2` object (`_type: projectSlideLayoutV2`) | Explicit declaration that this slide has a complete new layout |
| `layoutV2` | `version: 2` | Identifies the supported contract |
| `layoutV2.desktop` | `mode: center / justify` | Desktop mode |
| `layoutV2.mobile` | `auto: boolean` | Explicit mode; never re-infer from span coincidences once V2 is active |
| `layoutV2.mobile` | `orientation: portrait / landscape` | Owns new mobile arrangement independently of the legacy field |
| `layoutV2.mobile` | `mode: center / justify` | Retained manual mode; ignored for rendering while Auto is on |
| Each media entry | `desktopSpan: number` | Centered desktop span; also retains the Center return size during Justify |
| Each media entry | `mobileSpan: number` | Retained manual mobile span; ignored for rendering while Auto is on |

Use Sanity object types for nested desktop/mobile objects as required by the schema implementation. Existing array `_key` values are identities and must remain unchanged. Do not duplicate media arrays or assets inside layoutV2.

### Invariants

- Desktop Center accepts 6, 8, 10, 12, 14, 16; sum ≤24.
- Mobile's standard manual buttons offer 3, 4, 5, 6, 7, 8; active manual Center sum ≤12 in either orientation. While Auto is on, retained manual totals and Justify media-count restrictions do not invalidate the active layout. Retained fields must still have supported types and per-media span values. Switching Auto off requires a valid manual composition before saving.
- Preserve valid legacy custom mobile Center spans outside those six choices. Permit integer spans 1–11 for compatibility and show the current nonstandard value as an Existing choice; do not silently remap 10 to 8. The standard authoring UI continues offering only six new choices.
- Single source mobile span 12 becomes Justify, not a seventh Center size. Multi-item layouts containing 12 exceed the budget and are exceptions.
- Justify is valid only with one media. Initialize its retained Center return span to desktop 16/mobile 8 unless a prior explicit retained value already exists.
- With Auto on, effective mobile mode follows desktop and effective spans are exactly half desktop spans after normalization. Desktop Justify yields mobile Justify. Retained manual values never drive Auto rendering.
- On an inferred-Auto slide, seed retained manual values from the newly derived Auto composition (or Center return span 8 for Justify). This seed is not evidence of an original custom layout; retain inference reason in the report.
- Preserve explicit orientation. For absent orientation, propose Landscape to match the current frontend fallback and record that decision in the report. Unknown nonempty orientation is an exception requiring a choice.
- Write the slide marker and all required per-media fields in the same atomic document transaction. A marker alone never means the data is valid.

Keeping orientation inside V2 avoids changing the legacy live renderer when new settings are staged or edited later. Preserve legacy `mobileOrientation`, start/end fields, and all asset fields unchanged during backfill.

## 4. Migration scope and snapshot

A fresh audit is required; earlier span reports are historical evidence only.

1. Verify project/dataset against the configured CMS and explicitly name the execution target in every report. Current local configuration targets the production dataset; a local Studio is not a separate database.
2. Inventory all owning documents and slide paths. Begin with project documents; inspect selected-work references and any embedded slide copies so no consumer is overlooked. Do not assume every rendered slide has a separate stored copy.
3. Enumerate published documents and drafts independently using a view that does not overlay one with the other. Include draft-only projects. Identify release/version documents if present and list them separately; do not silently omit or migrate them without a scope decision.
4. Export a recoverable snapshot of all affected document variants, including full media objects, keys, revisions, types, IDs, timestamps, and reference fields. Keep it outside public/static folders and Git. Record a checksum and verify the export can be read back.
5. Keep a per-document baseline and exact patch manifest for this migration. No new document IDs or assets are created; do not publish drafts or copy draft content into published documents.

Published and draft variants can legitimately differ. Generate each proposal from that variant's own source. If a draft is later published, its V2 data must be complete; migrating only published variants would allow an old draft to undo adoption.

## 5. Deterministic conversion

### Desktop

Validate integer legacy lines before subtracting them: start ≥1, end ≤25, end > start.

| Valid source span | Proposed desktop result |
| --- | --- |
| 4 | Center 6 |
| 6 | Center 6 |
| 7 | Center 6 (subsequently approved for the Nike exception) |
| 8 | Center 8 |
| 9 | Center 8 |
| 10 | Center 10 |
| 12 | Center 12 |
| 14 | Center 14 |
| 16 | Center 16 |
| 18 | Center 16 |
| 24, exactly one media | Justify; retained Center span 16 |
| 24 with multiple media | Exception |
| Any other span, missing/malformed lines | Exception |

Ignore old absolute positions for new composition, but retain them in original fields and the report. Do not use the frontend's nearest-size or missing-span compatibility fallback to silently repair migration inputs.

Calculate the complete normalized total before proposing a write. For example, four old six-column items yield 24 and are valid; 18+9 becomes 16+8=24; 14+12 remains 26 and is blocked. Even when a composition can be visually shrunk, it remains invalid authoring data. Do not reduce another media automatically to make it fit.

### Mobile classification, before modifying source values

Treat the whole slide as Auto if all mobile line pairs are absent, or every pair is valid and its span equals the old Center default for that media count:

| Media count | Default span per media |
| --- | --- |
| 1 | 8 |
| 2 | 6 |
| 3 | 4 |
| 4 | 3 |

Compare lengths, not starting positions. This heuristic intentionally cannot distinguish manually chosen values that happen to equal the defaults; list inferred-Auto records for review. After migration, explicit Auto/manual state removes this ambiguity permanently.

All other slides are manual: preserve valid spans exactly, convert single 12 to Justify, and preserve orientation. Partial absence, invalid lines, and totals >12 are exceptions. Do not mistake “one default item plus one missing item” for Auto.

Mobile lines must be integers with start ≥1, end ≤13, and end > start. Do not derive custom spans from desktop. For Auto, derive halves of resolved desktop values: 6→3, 8→4, 10→5, 12→6, 14→7, 16→8. The six odd/even results are intentional.

## 6. Dry-run deliverables and exception review

Produce both a machine-readable manifest and a human-readable Markdown report. Each slide row must include:

- Project title/slug, exact document ID and variant, slide key/index, media keys/order, source revision.
- Original desktop/mobile line pairs and derived spans; original orientation.
- Proposed desktop mode/spans/total; mobile Auto inference reason or manual mode/spans/total; proposed orientation.
- Whether the change is a normalization, preserved custom layout, inferred Auto, new Justify, already migrated, or blocked exception.
- Numerical/rendering parity with the corrected local frontend where applicable; expected differences from the deployed grid separately identified.

Summary counts must reconcile: scanned = eligible + already migrated + blocked + explicitly excluded. List draft/published/release scope separately. Do not hide skipped data behind a success count.

Exceptions include invalid/missing/duplicate keys, zero or more than four media, unsupported lines/spans, normalized desktop overage, manual mobile overage, unknown orientation, incomplete existing V2 fields, and unsupported V2 versions. Broken media references and missing proportions are separate verification issues; do not repair or replace assets as part of this migration.

Review exceptions individually. Record approved resolutions keyed by document ID, slide/media key, and source revision in an explicit overrides file. No free-form rounding or automatic “best fit.” Re-run the dry run after resolutions and invalidate approvals for changed source revisions.

Default execution unit is a complete document variant: if one of its slides is blocked, hold the document rather than stamping a partially reviewed migration. Other explicitly approved document variants can be migrated independently; the old model remains available for held documents.

## 7. Backfill execution, only after separate authorization

The implementation should default to report-only mode. A write run must require an explicit execution option and exact target dataset/run manifest. The future approval must identify the reviewed manifest and whether both published and draft variants are included. This planning request authorizes none of those writes.

- Use keyed slide/media paths; never replace a whole document or media array just to add layout fields.
- Group a document variant's approved changes atomically and require its source revision to match the reviewed baseline.
- Recheck source keys, old fields, and new-field absence immediately before a write. Revision conflicts become skipped/review-needed results; do not overwrite newer edits or retry blindly.
- Write only V2 objects and new span fields. Preserve old fields, titles, assets, references, crop/hotspot data, ordering, and keys.
- Expect system revision/update timestamps to change. Do not attempt to forge them back to their original values.
- Account for configured webhooks/listeners: adding fields to published documents is still a production content write and may trigger downstream work, even when the live renderer ignores them. Review actual integrations before execution.
- Log exact before values, written values, returned revisions, success/failure, and run identity outside the content model. Avoid unnecessary migration metadata in editor-facing data.
- Reruns skip complete existing V2 data without overwriting editor changes. Flag partial/conflicting V2 state for review. A reviewed resume manifest may retry only genuinely unwritten records at current approved revisions.
- After any partial failure, reconcile database state before resuming; do not equate a process exit code with complete migration.

## 8. Verification before adoption

For every migrated variant, re-read and validate:

- All intended fields exist, supported modes/versions are correct, keys/order remain unchanged, and spans/totals satisfy the new contract.
- Effective Auto spans equal desktop halves; custom mobile values and orientation are preserved or match explicit approved overrides.
- Legacy fields and unrelated document content are unchanged except expected system fields and newly added fields.
- Original and new resolvers produce equivalent effective modes, spans, assets, and geometry for supported source content. Approved exception resolutions have separately recorded expectations.
- Draft and published variants retain their independent values/status; no draft was published or discarded.
- Report totals reconcile with the write log and enumerate every skipped/conflicted record.

Test fixtures include every mapping, single Justify, odd Auto spans, manual span 10, default-length manual ambiguity, absent/partial mobile data, duplicate keys, normalized overages, malformed V2, revision conflicts, idempotent rerun, and failure/resume. Include tall OVO imagery at a wide desktop viewport to preserve width-first clipping, plus row/stack mobile and media overrides.

For realistic migration verification, run the generated process against an isolated test dataset or local document fixtures first. Creating or importing to another dataset is a separate action to authorize; fixture-based tests can proceed during an authorized implementation without touching production content.

## 9. CMS and frontend adoption

### Compatibility and sequencing

Backfilled fields alone must not switch the live renderer/editor. Keep new-field consumption behind a deployment/configuration-controlled cutover until verified. Stage compatibility code locally before write execution; deploy only with separate approval. The old live grid continues consuming unchanged legacy fields until adoption is explicitly enabled.

At cutover, use V2 only when the slide's complete supported contract validates. Slides without V2 use the existing legacy resolution. Partial or malformed V2 produces a diagnostic and explicit legacy fallback, never a field-by-field mixture or a newly inferred Auto flag. Track fallback cases so they cannot become invisible permanent failures.

During the interval between backfill and cutover, the old planner can still change old fields. Therefore either perform backfill and cutover in a brief agreed editing pause, or re-audit all staged sources immediately before cutover and regenerate affected proposals. Retained legacy fields are not automatically synchronized with V2. Never silently overwrite post-migration new-model edits during reconciliation.

### CMS integration

- Define V2 schemas and mode-aware validation. Legacy slides continue using legacy validation; V2 slides validate the new complete model. Hidden legacy required/default checks must not block new-model publishing.
- Convert the new planner from a mock into the active editor only in this separately implemented phase. Remove “mock” naming when it actually persists changes.
- Use stable-key patches and atomic valid layout updates. Keep temporary invalid selections in local editing state while retaining the last valid preview; never write invalid combinations merely because the preview is frozen.
- Persist valid changes through normal Studio draft editing; no new bottom Save/Reset/Close buttons. Do not publish automatically. A single layout change should not patch unrelated media fields.
- With invalid pending selections, other changes must not serialize the invalid layout. Remote changes/reordering require reconciliation or an explicit reload; last-valid preview state must not conceal source changes.
- Retain manual settings through Auto toggles, preserve orientation, and disable Mobile view while Auto is on. When new media is added, initialize suitable spans and revalidate the full budget; do not silently shrink other media.
- For V2 slides, retain the old planner as read-only during transition. Permit its normal editing only on legacy slides. Do not run two competing editable layout systems or implement unreviewed reverse conversion.
- Update media/slide list previews that currently describe old column lines so they reflect active V2 sizes and modes.

### Frontend integration

- Extend types/queries and centralized layout resolution to consume valid explicit V2 modes/spans; keep geometry separate from source interpretation.
- Do not reconsolidate V2 spans or re-infer Auto from manual values that happen to match old defaults.
- Preserve corrected desktop width-first sizing, centered flex, equal gaps, existing mobile containment/orientation, and full-cover Justify.
- Review all consumers, including project-detail and selected-work/homepage slides, with the same compatibility policy.
- Run focused tests, type checks, builds, and local Studio/frontend browser comparisons with both legacy and V2 fixtures before deployment.

## 10. Rollback

Before new editing starts, a guarded rollback can remove only fields added by this run if their current values/revisions still match the logged migrated state. Never restore the full dataset over unrelated newer edits. Retained original fields support returning to the legacy path for untouched content.

After V2 editing starts, old fields are historical snapshots and may be stale. Switching the renderer back to them can lose visible layout changes. Take a current snapshot, identify changed V2 records, and either restore a known-compatible V2 application build or separately review reverse-conversion/resolution. Do not claim rollback is lossless merely because old fields were retained.

Keep schema definitions for all retained content fields throughout the rollback period. Field deletion, legacy planner removal, and migration artifact disposal are separate later cleanup decisions.

## 11. Delivery phases and completion gates

1. **Plan approval:** agree on target fields, source interpretation, custom-span compatibility, and migration scope.
2. **Implementation authorization:** build pure converter, dry-run reporting, fixtures, schema/reader/editor compatibility locally. No production writes or deployment implied.
3. **Dry-run review:** deliver inventory, snapshot verification, exact proposed changes, exceptions, and approved resolutions.
4. **Write authorization:** execute only the approved manifest against the named dataset; verify and reconcile all outcomes.
5. **Cutover authorization:** verify source drift, deploy/enable compatible frontend and CMS together under an agreed editing window, and monitor fallback/validation issues.
6. **Later retirement:** after real editing and rendering are stable, separately plan removal of legacy UI/fields.

Migration completion requires verified data for every approved document variant and an explicit report of held/excluded records. Adoption completion additionally requires successful CMS/frontend consumption and editing tests. A passed script or schema build alone completes neither phase.

## 12. Planned artifacts

- This CMS plan as the cross-repository source of truth.
- A deterministic pure legacy-to-V2 converter with fixture tests.
- A read-only audit/dry-run command and human/machine reports.
- A guarded, opt-in writer with revision checks, manifest/log support, and tested resume/rollback handling.
- Additive schemas/types plus CMS editor and frontend resolver changes in their respective repositories.
- Before/after screenshots and recorded checks for representative single, diptych, triptych, four-media, Justify, Auto, custom mobile, and stacked mobile cases.

No implementation or live scan was performed while writing this plan; database counts and outstanding exceptions must come from the future fresh audit.

## 13. Local data-preparation implementation results

- Implemented pure conversion, authenticated raw-perspective audit, local snapshot/manifest/report generation, guarded keyed writer, revision checks, verification journals and guarded rollback under `scripts/layout-migration/`.
- Seven tests passed, including an in-memory writer test; no test writes to Sanity.
- Fresh read-only production audit saved in `layout-audit-1793925099748.local/`: 11 document variants (10 published, 1 draft), 10 eligible and 1 blocked. Nike (`nike`) slide 2, key `0b01b4145c1d`, has desktop span 7 and no approved mapping. No override was invented.
- No production mutation, publishing, schema deployment, or application cutover was performed. The private scoped snapshot and proposed-change report are preserved locally and ignored by Git.
- Outstanding phases: approve exception mapping; additive V2 schemas and editor/frontend compatibility implementation; refreshed manifest review; separately authorized write and cutover. The writer intentionally cannot force blocked records through.

### Approved Nike resolution

On 2026-11-05 the user approved desktop span 7 → 6. The converter and mapping fixtures now include this rule. The earlier blocked report remains a historical snapshot; a fresh audit is required before any write. This mapping approval does not by itself execute the guarded production write or application cutover.

### Authorized production execution

The user subsequently requested the hard migration. Executed reviewed manifest `35a93a43a8c0f09df79918d5c3b9a48be9229b5ca29c1e563360ab4fe1abe609` against `3vmzcbnr/production`: all 11 document variants verified (86 slide instances, 99 media instances including drafts). Original grid fields, media keys/order and unrelated content were retained. Nike new desktopSpan is 6 while its original span 7 remains as rollback data. Final independent audit in `layout-audit-1793925292450.local/` reports 11 already migrated, no blocked or pending records. Snapshot, manifest, execution journal and result are in `layout-audit-1793925227367.local/`. No draft publishing or code deployment was performed.

### Local CMS/frontend adoption

Implemented after the user requested connecting both applications. Additive V2 schema objects and span fields are registered locally. New slides initialize with V2 Center/Auto; new media initialize with spans 6/3. Migrated slides use the active persisted planner; the old planner entry is disabled and its editing component is not mounted for V2 slides. Media list previews show new column spans. Hidden legacy orientation requirements no longer block V2 slides.

The planner initializes explicit V2 Auto/manual modes, retains manual values, and emits keyed atomic layout patches only after user edits produce a fully valid layout. Opening the planner does not save. Invalid pending selections remain local, and source signatures distinguish own patch echoes from external changes. Source changes require reload. Closing discards invalid pending selections; valid changes use ordinary Studio draft saving, with no automatic publishing.

Frontend types and centralized resolvers now read complete valid V2 directly without re-consolidation or Auto re-inference, including V2 mobile orientation. Invalid/unsupported V2 falls back to the entire legacy interpretation with diagnostics. Existing query spreads include the new fields for both project and selected-work consumers.

Verification: CMS TypeScript and both local builds pass; frontend check has zero errors/four existing navigation warnings. Eighteen frontend tests, seven migration tests, 1,554 CMS geometry/budget combinations, and a React in-memory persistence harness pass. The harness confirms no write on open, valid save/echo, invalid edit retention/recovery, and remote-change protection without touching production. Both validators accept all 86 slide variants in the verified post-migration snapshot. Browser confirmed migrated OVO controls, legacy editing lock, and local frontend rendering. A Chrome extension blocked a later frontend refresh; alternate in-app preview rendered OVO at the expected 525 × 668.8px at 1280 × 720. Screenshot: cms-persisted-planner.png in the current visualization folder.

No code was deployed or pushed, no draft published, and no live layout edited for testing in this adoption task. Deployment/cutover is still a separate step.

### Pre-deployment review corrections

- The media-add guard now wraps the default slide fields in Sanity's form callback provider, preserving the surrounding focus/navigation callbacks. Native nested-field edits and direct input edits both reach the guard; adding another media emits Center mode changes in the same patch event. No repair writes occur on mount or remote updates, and read-only inputs cannot write.
- CMS, frontend, and audit validators now ignore retained manual composition budgets and Justify media-count restrictions while mobile Auto is active. Desktop constraints and structural field checks remain enforced. Manual controls restore their retained settings when Auto is disabled, and invalid pending manual selections remain local until corrected.
- Regression coverage uses Sanity's real callback context for the media-add path, exercises Auto-to-manual recovery and persistence, and verifies frontend Auto geometry without legacy fallback. These corrections require no content migration.
