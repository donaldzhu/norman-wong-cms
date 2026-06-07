import {at, createOrReplace, defineMigration, delete_, set, unset} from 'sanity/migrate'

import {stripSanityMeta, transformTypes} from './transformTypes'

const LEGACY_GRID_TYPE = 'selectedWorks'
const LEGACY_LIST_TYPE = 'allProjects'
const TEMP_GRID_ID = '_temp_swap_grid'
const TEMP_LIST_ID = '_temp_swap_list'

const isDraftId = (id: string) => id.startsWith('drafts.')
const baseId = (id: string) => id.replace(/^drafts\./, '')
const tempId = (id: string, suffix: 'grid' | 'list') =>
  isDraftId(id) ? `drafts.${suffix === 'grid' ? TEMP_GRID_ID : TEMP_LIST_ID}` :
    suffix === 'grid' ? TEMP_GRID_ID : TEMP_LIST_ID

const finalId = (id: string, target: 'grid' | 'list') => {
  const name = target === 'grid' ? 'allProjects' : 'selectedWorks'
  return isDraftId(id) ? `drafts.${name}` : name
}

/**
 * Renames selectedWorks ↔ allProjects document types, singleton IDs, nested
 * object _types, and project.allProjectsThumbnails → selectedWorksThumbnails.
 *
 * Singleton swap uses temp document IDs so the two singletons can exchange
 * `_id`s without one migration pass deleting the other’s newly created doc.
 *
 * Dry run (default):
 *   npx sanity migrations run swap-selected-all-naming
 *
 * Apply to production:
 *   npx sanity migrations run swap-selected-all-naming --no-dry-run --no-confirm
 */
export default defineMigration({
  title: 'Swap selectedWorks / allProjects naming',
  documentTypes: ['selectedWorks', 'allProjects', 'project'],
  filter: `
    _id in [
      "selectedWorks", "allProjects",
      "drafts.selectedWorks", "drafts.allProjects",
      "${TEMP_GRID_ID}", "${TEMP_LIST_ID}",
      "drafts.${TEMP_GRID_ID}", "drafts.${TEMP_LIST_ID}"
    ]
    || (_type == "project" && defined(allProjectsThumbnails))
  `,

  migrate: {
    document(doc) {
      const id = doc._id as string
      const docType = doc._type as string
      const canonicalId = baseId(id)

      if (
        canonicalId === 'selectedWorks'
        && docType === LEGACY_GRID_TYPE
        && 'desktopLayout' in doc
      ) {
        return [
          createOrReplace({
            ...transformTypes(stripSanityMeta(doc as Record<string, unknown>)),
            _id: tempId(id, 'grid'),
            _type: LEGACY_GRID_TYPE,
          }),
          delete_(id),
        ]
      }

      if (
        canonicalId === 'allProjects'
        && docType === LEGACY_LIST_TYPE
        && !('desktopLayout' in doc)
      ) {
        return [
          createOrReplace({
            ...transformTypes(stripSanityMeta(doc as Record<string, unknown>)),
            _id: tempId(id, 'list'),
            _type: LEGACY_LIST_TYPE,
          }),
          delete_(id),
        ]
      }

      if (canonicalId === TEMP_GRID_ID && docType === LEGACY_GRID_TYPE) {
        return [
          createOrReplace({
            ...transformTypes(stripSanityMeta(doc as Record<string, unknown>)),
            _id: finalId(id, 'grid'),
            _type: 'allProjects',
          }),
          delete_(id),
        ]
      }

      if (canonicalId === TEMP_LIST_ID && docType === LEGACY_LIST_TYPE) {
        return [
          createOrReplace({
            ...transformTypes(stripSanityMeta(doc as Record<string, unknown>)),
            _id: finalId(id, 'list'),
            _type: 'selectedWorks',
          }),
          delete_(id),
        ]
      }

      if (docType === 'project' && 'allProjectsThumbnails' in doc) {
        const thumbnails = (doc as {allProjectsThumbnails?: unknown}).allProjectsThumbnails

        return [
          at('selectedWorksThumbnails', set(transformTypes(thumbnails))),
          at('allProjectsThumbnails', unset()),
        ]
      }
    },
  },
})
