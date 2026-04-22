import {ListIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'

export function allProjectsStructure(S: StructureBuilder) {
  return S.listItem()
    .title('All projects')
    .icon(ListIcon)
    .id('singleton-all-projects')
    .child(S.document().schemaType('allProjects').documentId('allProjects'))
}
