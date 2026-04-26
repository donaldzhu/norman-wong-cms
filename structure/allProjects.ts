import { ListIcon } from '@sanity/icons'
import type { StructureBuilder } from 'sanity/structure'

export const allProjectsStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('All projects')
    .icon(ListIcon)
    .id('singleton-all-projects')
    .child(S.document().schemaType('allProjects').documentId('allProjects'))
