# Slide planner view and sizing revision

Date: 2026-11-05
Status: Implemented locally after explicit authorization; no deployment or content migration.
Repository: norman-wong-cms

## Objective and precedence

Give the existing mock one scrolling area and one active editing view. Place Desktop/Mobile selection and the Auto switch together above the preview. Match the corrected desktop frontend width sizing.

This supersedes sections of PROJECT_SLIDE_DESKTOP_MOBILE_MOCK_PLANNER_PLAN.md that show both settings sections together, allow Mobile preview while Auto is on, or fit desktop media to preview height. Its read-only asset access, temporary-state isolation, budgets, six size buttons, legacy-value preservation, and old-planner retention remain in force.

Corresponding frontend plan: ../../norman-wong-svelte/plans/DESKTOP_COLUMN_WIDTH_CORRECTION_PLAN.md.

## Scope

Extend the local mock only. No schema additions, persisted Auto flag, document patches, migrations, changes to the original planner, frontend writes from the CMS, push, or deployment. “Backend” here means the CMS interface; no server or content-model changes are needed.

## Dialog structure

1. Top toolbar: Desktop and Mobile on the left; the switch labeled “Auto layout for mobile” aligned to the right.
2. Active view's preview.
3. Active view's layout controls and media cards.
4. Reset and Close.

Desktop view shows desktop Center/Justify, desktop budget, and six desktop size buttons only. Mobile view shows the orientation dropdown, manual mobile Center/Justify, mobile budget, and six mobile size buttons only. Keep existing-value options for valid nonstandard custom mobile spans.

Remove redundant Desktop/Mobile section headings if the selected tab already supplies context. Keep previews noninteractive and functional error messages concise. Toolbar may wrap on narrow dialogs without creating horizontal overflow; keep the switch at the end of the toolbar.

## Auto and view behavior

- Auto starts on for the existing inferred-default rules; custom mobile layouts start off.
- Auto on disables the Mobile tab and keeps Desktop active. Mobile is unavailable for both viewing and editing in this revision.
- Turning Auto off enables Mobile but leaves the current Desktop view selected; the user chooses Mobile explicitly.
- Turning Auto on while Mobile is active switches to Desktop immediately.
- Preserve the manual mobile snapshot through Auto toggles. First switch to manual seeds current effective Auto sizes/mode; later switches restore prior manual choices.
- View selection never changes sizes, mode, or orientation.
- Auto continues deriving mobile sizes from current desktop values even though its preview/controls are hidden.
- Orientation is editable in Mobile/manual view only. Auto preserves the existing/local orientation; toggling Auto must not reset it. This intentionally replaces the earlier always-visible orientation control.
- Reset/reload reinitializes from current source, recomputes Auto, and returns to Desktop. Close discards temporary settings.

Use accessible pressed/selected states, ordinary non-submit buttons, a labeled switch, and a disabled Mobile explanation available on hover/focus: “Turn off Auto layout for mobile to edit mobile settings.” If a disabled button cannot receive focus, use the existing accessible tooltip wrapper pattern. Preserve focus predictably when switching views; do not remove the focused Auto switch when returning to Desktop.

## One scrolling area

The screenshot shows two adjacent scrollbars. Current code combines Sanity Dialog's scroll behavior with a child Box that has its own maxHeight and overflowY:auto. Inspect the rendered dialog to confirm both scrolling elements before changing CSS.

Use Sanity Dialog's existing content scroll area as the sole vertical scroll owner. Remove the extra child overflow/max-height constraint and retain the dialog's viewport height limit. The inner Stack, settings, cards, and preview must not become separate vertical scroll panes. If the installed Dialog API requires a different explicit content wrapper, choose one owner and disable the competing one; do not hide scrollbars cosmetically.

The toolbar can scroll with content; no new sticky behavior is required. Keep the preview's roughly 40vh display cap and scale its entire reference canvas to fit. Preview overflow clipping is part of the slide simulation, not another scrollable area. Ensure wheel, trackpad, keyboard, and focus scrolling can reach all controls and Reset/Close.

## Preview sizing parity

Apply the frontend width correction to desktop Center preview: compute widths from 24 tracks plus internal gutters, derive height from aspect ratio, and do not shrink media to fit preview height. Keep width-only boundary fitting, original order, equal gaps, vertical centering, and viewport clipping. A tall image should extend outside the reference slide and be clipped, exactly as on the corrected frontend.

Retain desktop reference 1280 × 720 and mobile reference 390 × 844, with 20px reference gutters and the legacy 8px sizing buffer. Scaling the complete reference canvas to fit the dialog is distinct from shrinking media inside that canvas. Test tall-content geometry at 2560 × 1233 as well, even though no extra viewport chooser is added to the UI.

Mobile geometry and containment remain as implemented. Mobile orientation changes row/stack arrangement inside the mobile reference frame, not frame rotation. Justify remains single-media cover. Strict 24/12 authoring budgets still suppress invalid selected-view previews; clipping tall valid media must not be confused with accepting an over-budget layout.

## Implementation steps

1. Recheck local changes and the paired frontend correction contract.
2. In projectSlideMockDialog.tsx, move the existing Auto control into the top Flex row, right aligned. Disable Mobile in Auto, atomically return to Desktop when enabling Auto, and conditionally render only the active settings section.
3. Preserve all local mobile state outside conditional view rendering so unmounting controls does not discard it. Keep orientation in mobile/manual controls.
4. Remove the redundant nested scrolling wrapper after identifying the Dialog's actual scroll owner. Validate with long four-media content and a small laptop window.
5. Update utils/projectSlideMockLayout.ts and projectSlideMockPreview.tsx for desktop width-only containment. Preserve mobile geometry and noninteractive reference scaling.
6. Add focused state-transition/geometry checks, including tall desktop media. Keep parity checks with the frontend, but also assert independently specified expected dimensions so two implementations cannot agree on the same regression unnoticed.
7. Run TypeScript and build. Verify the local Studio with real existing media through mock controls only. Capture desktop and manual-mobile screenshots with the toolbar visible. Update plan status with actual results.

No change is required to schemaTypes, existing saved span fields, or the original planner's mutation callbacks.

## Acceptance criteria

- [ ] Exactly one vertical dialog scroll owner; no nested settings scrollbar or horizontal scrolling.
- [ ] Top toolbar shows tabs on the left and Auto on the right; wraps cleanly when needed.
- [ ] Auto on disables Mobile and displays desktop settings only.
- [ ] Auto off enables Mobile; Mobile view displays only its own preview/settings/orientation.
- [ ] Enabling Auto from Mobile returns to Desktop, preserves manual settings and orientation, and keeps focus usable.
- [ ] Manual values, including an existing span 10, survive view and Auto changes; no hidden size controls are keyboard-focusable.
- [ ] Desktop sizing matches the corrected frontend, including tall-content clipping and fixed width across viewport heights.
- [ ] Mobile sizing, independent budgets, Justify limits, source-change handling, reset, and close/reopen remain correct.
- [ ] Opening/editing/toggling/resetting/closing the mock emits no Sanity mutation; verify callback isolation and network requests during the browser pass.
- [ ] Long dialogs can reach footer actions by keyboard and pointer at laptop/mobile Studio widths.
- [ ] TypeScript, build, focused tests, and browser screenshots are recorded accurately; incomplete checks are named.

## Delivery order and rollback

Implement and verify the frontend sizing contract first, then apply the CMS geometry correction together with this UI revision. Both remain local. Revert only revision-specific code to roll back; temporary-state edits require no dataset restoration.

## Implementation verification

- Moved Auto into the top toolbar and conditionally rendered active-view settings. Auto disables Mobile and returns an active Mobile view to Desktop.
- Removed child scrolling styles; DOM inspection found exactly one vertical scroll owner inside the mock dialog (869px client height, 937px content in the tested window).
- Desktop preview now preserves column widths for tall media; mobile containment is unchanged. Independent tall-content fixture and 1,554 combination/parity checks passed.
- TypeScript check and local Studio build passed.
- Browser tested an existing OVO diptych: Auto disabling/enabling Mobile, manual size change to 5+4, Portrait orientation, Auto-on return to Desktop, and restoration of the 5+4 Portrait settings after toggling back. Closing discarded temporary settings.
- Screenshots saved as cms-desktop-tabs.png and cms-mobile-tabs.png in the current visualization folder.
- Mock still accepts no document mutation callback and uses only asset fetches. No schema or frontend application code changed during this revision. Request-level mutation monitoring and exhaustive small-window keyboard checks were not performed.

### Subsequent local UI refinements

- Mobile orientation now follows Center/Justify with extra space below; preview canvas is white; bottom Reset/Close actions removed (dialog × still closes). Reload is available only when source changes.
- Over-budget feedback now sits beneath the mode/budget row and states total, limit, excess, and the remedy. Each view retains its last valid layout while over budget, resuming updates as soon as the sizes are valid. This supersedes the earlier requirement to suppress over-budget previews. A newly opened invalid layout with no prior valid state keeps an empty canvas until corrected; stale-source and asset errors remain separate.
- Browser verified unchanged desktop preview dimensions at 28/24 and mobile at 16/12, plus desktop recovery when reduced to 20/24. Temporary test settings were discarded on close.
