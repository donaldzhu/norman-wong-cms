import { defineMigration, set } from 'sanity/migrate'

/**
 * Renames `type` → `mediaType` on nested `projectSlideMedia` objects
 * (stored under `project` → `slides[]` → `media[]`).
 *
 * Run order: dry-run first, then `--no-dry-run`. Deploy the schema rename after
 * content has been migrated (or keep both fields briefly if you need a two-step rollout).
 */
export default defineMigration({
  title: 'Rename projectSlideMedia.type to mediaType',
  documentTypes: ['project'],
  migrate: {
    object(node) {
      if (node._type !== 'projectSlideMedia') return

      const row = node as unknown as {
        _type: string
        _key?: string
        type?: 'image' | 'video'
        mediaType?: 'image' | 'video'
        [key: string]: unknown
      }

      if (row.type === undefined) return

      const { type, ...rest } = row
      return set({
        ...rest,
        mediaType: row.mediaType ?? type,
      })
    },
  },
})
