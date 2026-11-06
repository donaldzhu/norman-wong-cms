# Stricter validation dry-run report

Snapshot: November 5, 2026 at 1:12 p.m. (America/Toronto).  
Exact snapshot timestamp: 2026-11-05T18:12:18.976Z.  
Project: `3vmzcbnr`; dataset: `production`.  
Sanity runtime: 5.31.2.

## Result

The current rules produced **zero validation markers across 15 project/All Projects documents**. The proposed rules produced **13 new errors in one document: published `allProjects`**. The other 14 document versions had no new errors.

Every new error concerns media membership: an All Projects selection references an existing asset that is absent from its selected project's active slide media. This is a proposed editorial restriction, not proof that the asset is missing or that the current website is broken.

If enforced as an error, this rule would block the next publication of All Projects until the selections or rule are changed. It does not unpublish the existing page. No application source, deployed schema, or CMS content was changed by this check.

## Affected selections

Positions below are one-based, matching the snapshot's array order. Use the stable keyed paths later in this report if items have since been reordered.

| All Projects entry | Selected project | Media positions affected | Count |
| --- | --- | --- | --- |
| 1 | 9million | 1, 2 | 2 |
| 2 | Hablot | 9 | 1 |
| 3 | Charlotte Cardin | 1 | 1 |
| 4 | SSENSE | 1, 2, 3, 4, 5, 6, 7, 8, 9 | 9 |

That is **13 of the 40 media selections**, across **4 of 5 project entries** in All Projects. There is no draft of All Projects in this snapshot. Neither of the two project drafts introduced a new failure.

These assets are also absent from their selected projects' published active slides; the result is not just a draft-versus-published mismatch. A supplementary check found no matching references in those published projects' alternate desktop/mobile media fields either.

## Rules previewed

| Proposed check | Result |
| --- | --- |
| Active image/video contains an asset reference, not only an object wrapper | No failures |
| Active image/video asset exists and has the expected asset type | No failures |
| All Projects destination exists as a published project under strong-reference validation | No failures |
| All Projects selected media belongs to the selected project's draft-first active slides | 13 selections flagged |

All three Mux video documents had ready status and a playback ID. Processing readiness was inspected separately; it was not added as a new publication rule.

All five All Projects project references are currently stored as weak references and resolve to published projects in this snapshot. They are candidates for a separately reviewed weak-to-strong conversion if that workflow is chosen. This run did not convert them or execute a migration dry run.

## Recommendation before enforcing membership validation

Review whether these 13 selections are intentional—for example, alternative overview images that do not appear in the project's slideshow. The data alone cannot establish editorial intent.

If they are intentional, either permit independent All Projects media or introduce a deliberate exception policy. If selections are meant to come strictly from the project slides, replace the affected selections or add the intended media to the appropriate projects. Do not automatically delete the selections.

Start with a visible membership warning while this policy is resolved. Missing-asset and missing-destination protection can be evaluated independently; those proposed checks found no affected content here.

## Exact field paths

Document ID: `allProjects`.  
Snapshot revision: `lezqo3cOoSgZhTXv4GTaQa`.

| Selected project | Media position/type | Stable field path within All Projects |
| --- | --- | --- |
| 9million | 1 (image) | `projects[_key=="0651ce6647ab"].media[_key=="8f01a41458bf"]` |
| 9million | 2 (image) | `projects[_key=="0651ce6647ab"].media[_key=="b114f1d6bba7"]` |
| Hablot | 9 (video) | `projects[_key=="5d006543251d"].media[_key=="a7f3a71f9b1f"]` |
| Charlotte Cardin | 1 (image) | `projects[_key=="847a87475249"].media[_key=="627b16f13279"]` |
| SSENSE | 1 (image) | `projects[_key=="e84f75d37f6e"].media[_key=="402983c80445"]` |
| SSENSE | 2 (image) | `projects[_key=="e84f75d37f6e"].media[_key=="2300e53d56fb"]` |
| SSENSE | 3 (image) | `projects[_key=="e84f75d37f6e"].media[_key=="c29c9453f778"]` |
| SSENSE | 4 (image) | `projects[_key=="e84f75d37f6e"].media[_key=="7aeefd749ecf"]` |
| SSENSE | 5 (image) | `projects[_key=="e84f75d37f6e"].media[_key=="abfdf5fc7a07"]` |
| SSENSE | 6 (image) | `projects[_key=="e84f75d37f6e"].media[_key=="abe4572ac1c7"]` |
| SSENSE | 7 (image) | `projects[_key=="e84f75d37f6e"].media[_key=="46457d54e00a"]` |
| SSENSE | 8 (image) | `projects[_key=="e84f75d37f6e"].media[_key=="ef3807935d8a"]` |
| SSENSE | 9 (image) | `projects[_key=="e84f75d37f6e"].media[_key=="c0baebad322b"]` |

The common proposed message is: “Replace or remove media that no longer belongs to this project.” Recheck the document revision before any later repair; these are snapshot locations, not authorization to modify content.

## Method and verification

1. Read production content using the authenticated Sanity client with the raw perspective and CDN disabled. The snapshot contains 12 published project documents, 2 project drafts, and 1 published All Projects document. No release versions of these types were returned.
2. Capture an inventory of 229 document IDs/types and the three Mux asset status records for reference checking. No content mutations were issued.
3. Compile the repository's current schema definitions and run Sanity's actual document validator against the 15 content documents.
4. Compile a second schema in memory with the proposed asset-reference checks, strong project-reference validation, and project-media membership validation. Do not edit the repository schema files.
5. Validate against the same frozen snapshot, using draft-first lookup for media membership and published-target checks for project destinations. Reference checks and schema queries use the local snapshot, so the comparison does not drift between passes.
6. Compare markers by document, path, severity, and message. Negative controls confirmed that an empty image wrapper, a missing video asset, and a missing project destination pass the current rules but fail the candidate rules.

UI rendering imports were stubbed to load schema definitions outside Studio. The actual Sanity schema compiler and validator were used; this was not a browser publishing test. The proposed rule functions are diagnostic implementations of the plan, not finalized application changes.

**Severity caveat:** validation was run in Studio mode to model publish-blocking severity. In the installed runtime, the CLI-mode unknown-field wrapper can downgrade object-rule markers to warnings, even when a custom rule requests errors. This was observed during the comparison and checked against the installed validation source. Do not infer publishability solely from the severity of a plain CLI report for this version.

## Scope and limits

- This checks the proposed asset/reference/membership rules for project and All Projects content. It is not a full content-health audit of Header, Info, Selected Works, asset metadata, row-width normalization, or duplicate singletons.
- Optional mobile overrides retain their current validation and fallback rules. The new asset-presence checks apply to active primary image/video fields.
- Media identity is the exact asset reference plus media type. Visually similar uploads with different asset IDs are distinct assets for this policy.
- The snapshot reflects documents readable by the authenticated account at the recorded time. It is not a guarantee about subsequent edits.
- No cleanup or migration is necessary merely to produce this report. New enforcement should follow the editorial decision above.

## Repeating the dry run

Sanity supports validating content with a local schema and an exported snapshot. See the [documents CLI reference](https://www.sanity.io/docs/cli-reference/documents) and [schema validation documentation](https://www.sanity.io/docs/content-lake/schema-validation-and-the-content-lake).

For a future reproducible implementation, keep a baseline and candidate schema in an isolated review environment, validate both against the same NDJSON export, and compare the results. A native CLI invocation, once that export exists, is:

```sh
./node_modules/.bin/sanity documents validate \
  --workspace default \
  --file /absolute/path/to/content-snapshot.ndjson \
  --format ndjson \
  --yes
```

This command checks the schema loaded by that working directory; it does not infer the proposed rules from a Markdown plan. Custom validators that read references must also use a consistent reference snapshot. Preserve the Studio-mode comparison for severity until the installed CLI behavior is resolved. Validation reads data; unlike migration execution, this command does not apply content patches.
