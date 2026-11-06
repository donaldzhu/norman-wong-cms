# Slide layout migration tooling

Data preparation is implemented. Production migration and CMS/frontend adoption are not executed. Keep the existing planner and runtime until the reviewed data and a separate cutover implementation are approved.

## Read-only audit

From the CMS root, with the existing Sanity CLI login:

    npx sanity exec scripts/layout-migration/audit.cjs --with-user-token

This wrapper can only audit. It explicitly selects project `3vmzcbnr`, dataset `production`, uses raw perspective to retain drafts independently, and saves a fresh `layout-audit-<timestamp>.local/` directory. The directory is ignored by Git. No mutation API is used on this path.

Outputs:

- `snapshot.json`: full owning documents returned by the audit, including IDs, revisions and original arrays.
- `manifest.json`: snapshot, deterministic keyed patches, exact proposals, exclusions, blocked documents and summary.
- `report.md`: human-readable slide conversion report and manifest checksum.

The snapshot is a scoped document backup, not an asset or full-dataset export. Assets are not changed by this migration. The query includes projects and other top-level documents with slides; non-project owners and release variants are reported as excluded pending review.

For fixture/offline conversion:

    node scripts/layout-migration/run.cjs --project fixture --dataset test --input /private/tmp/full-documents.json --out fixture-audit.local

Input must be an array of full Sanity documents, not a span-only report. The target of an offline report is a label supplied by the caller; it does not prove the snapshot originated there. Use the authenticated audit wrapper for an authoritative production proposal.

## Writes — not approved yet

The general runner has explicit `--execute` and `--rollback` modes. Neither runs by default. They require a manifest, matching explicit target, matching `--approve-sha`, authenticated token, and a new journal path. Do not run either until the user approves that exact operation and reviewed manifest.

Execution regenerates all proposals from the embedded snapshot before allowing writes. It adds new layout fields by stable keyed paths with revision guards, verifies the complete resulting document, and never publishes drafts or changes old start/end values. A document with any blocked slide receives no patch.

Journals distinguish held, write-attempted, written, verified and reconcile-required records. A failed/ambiguous commit can have reached the server: inspect the actual record before retrying. Resume by generating and reviewing a fresh audit; already migrated complete layouts are skipped, while incomplete V2 data is blocked.

Rollback requires a prior verified write journal for the same manifest and an unchanged post-write revision. It removes only the newly added fields, verifies the original content, and refuses records edited afterward. Never restore a full snapshot over newer edits.

Keep manifests and journals privately outside public/static folders. Do not put credentials in arguments or reports. The tooling accepts `SANITY_API_TOKEN` or the CLI-injected `SANITY_AUTH_TOKEN`.

## Exceptions and next phase

Unsupported spans and over-budget combinations are reported rather than guessed. Desktop 7 → 6 was explicitly approved on 2026-11-05 for the Nike exception and is now part of the converter. Other unsupported spans still require review. The current writer cannot force blocked records through.

Before an actual backfill, add the proposed V2 schemas and verify compatible CMS/frontend readers locally. Do not turn on consumption of new fields during staging. Later adoption must prevent the old and new editable planners from drifting apart, as specified in the migration plan.

## Tests

    node --test tests/layoutMigration.test.cjs tests/layoutMigrationWriter.test.cjs

Converter tests cover mappings, Auto/custom classification, exact custom-span preservation, malformed inputs, held documents, stable-key patches and rerun classification. Writer tests use an in-memory client only and cover revision conflicts, successful verification, repeat protection, rollback drift refusal, rollback and checksum rejection. No test contacts or writes Sanity.
