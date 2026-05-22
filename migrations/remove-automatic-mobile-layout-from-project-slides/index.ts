import {at, defineMigration, unset} from 'sanity/migrate'

/**
 * Removes deprecated `automaticMobileLayout` from project slides and any
 * legacy project-level copy of the same field.
 *
 * Dry run (default):
 *   npx sanity migrations run remove-automatic-mobile-layout-from-project-slides
 *
 * Apply to production:
 *   npx sanity migrations run remove-automatic-mobile-layout-from-project-slides --no-dry-run --no-confirm
 */
export default defineMigration({
  title: 'Remove automaticMobileLayout from project slides',
  documentTypes: ['project'],
  filter:
    'defined(automaticMobileLayout) || count(slides[defined(automaticMobileLayout)]) > 0',

  migrate: {
    document(doc) {
      if ('automaticMobileLayout' in doc) {
        return at('automaticMobileLayout', unset())
      }
    },

    object(node) {
      if (node._type === 'projectSlide' && 'automaticMobileLayout' in node) {
        return at('automaticMobileLayout', unset())
      }
    },
  },
})
