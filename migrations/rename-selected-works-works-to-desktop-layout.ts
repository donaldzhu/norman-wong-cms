import {at, defineMigration, set, unset} from 'sanity/migrate'

/**
 * Renames `works` → `desktopLayout` on `selectedWorks` documents.
 *
 * Run (dry run, default):
 *   npx sanity migrations list
 *   npx sanity migrations run <migration-id-from-list>
 *
 * Apply to dataset:
 *   npx sanity migrations run <migration-id-from-list> --no-dry-run
 *
 * Use --dataset and --project if not using sanity.cli.ts defaults.
 */
export default defineMigration({
  title: 'selectedWorks: rename works → desktopLayout',
  documentTypes: ['selectedWorks'],
  filter: 'defined(works)',
  migrate: {
    document(doc: Record<string, unknown>) {
      const works = doc.works
      return [at('desktopLayout', set(works)), at('works', unset())]
    },
  },
})
