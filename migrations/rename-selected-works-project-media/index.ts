import {defineMigration, set} from 'sanity/migrate'

const OLD_TYPE = 'selectedWorksProjectMedia'
const NEW_TYPE = 'selectedWorksMedia'

/**
 * Renames embedded array items under selectedWorks projects:
 * `_type: "selectedWorksProjectMedia"` → `_type: "selectedWorksMedia"`.
 *
 * Run (dry run first): `npx sanity migrations list` then
 * `npx sanity migration run rename-selected-works-project-media --no-dry-run`
 *
 * Back up the dataset before applying (e.g. `npx sanity dataset export production backup.tar.gz`).
 */
export default defineMigration({
  title: 'Rename selectedWorksProjectMedia to selectedWorksMedia',
  documentTypes: ['selectedWorks'],
  migrate: {
    object(node) {
      if (node._type === OLD_TYPE) {
        return set({...node, _type: NEW_TYPE})
      }
    },
  },
})
