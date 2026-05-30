import {at, defineMigration, unset} from 'sanity/migrate'

/**
 * Removes deprecated `hidden` from all project documents.
 *
 * Dry run (default):
 *   npx sanity migrations run remove-hidden-from-projects
 *
 * Apply to production:
 *   npx sanity migrations run remove-hidden-from-projects --no-dry-run --no-confirm
 */
export default defineMigration({
  title: 'Remove hidden field from projects',
  documentTypes: ['project'],
  filter: 'defined(hidden)',

  migrate: {
    document(doc) {
      if ('hidden' in doc) {
        return at('hidden', unset())
      }
    },
  },
})
