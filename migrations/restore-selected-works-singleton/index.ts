import {createOrReplace, defineMigration} from 'sanity/migrate'

/**
 * Restores the selectedWorks singleton after a partial swap-selected-all-naming run.
 * Safe to run when selectedWorks is missing; no-op if it already exists.
 *
 * Apply:
 *   npx sanity migrations run restore-selected-works-singleton --no-dry-run --no-confirm
 */
export default defineMigration({
  title: 'Restore selectedWorks singleton (list content)',

  async *migrate(_documents, context) {
    const client = context.client
    const existing = await client.fetch<{_id: string} | null>(
      `*[_id == "selectedWorks"][0]{_id}`,
    )

    if (existing) return

    yield createOrReplace({
      _id: 'selectedWorks',
      _type: 'selectedWorks',
      title: 'Selected Works',
      projects: [
        {_key: '7f6bcaa4fad0', _ref: 'b029b33d-fc07-46bd-b308-4753410e71b4', _type: 'reference'},
        {_key: '1a5e8b6409f5', _ref: 'c85d6fbf-f83a-44e3-b88e-6bd8ebbe97ae', _type: 'reference'},
        {_key: 'e62b6219c37a', _ref: '15977d42-d886-4294-9b12-556e22f72216', _type: 'reference'},
        {_key: 'cacee51bbb58', _ref: 'c0e7640a-f8af-480e-a0fd-8e4fad246810', _type: 'reference'},
        {_key: '4d5d685e8716', _ref: 'e8662cc5-1737-49c1-8ba5-5cd9ae5c6e5a', _type: 'reference'},
      ],
    })
  },
})
