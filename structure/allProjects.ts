import { StarIcon } from '@sanity/icons'
import type { StructureBuilder } from 'sanity/structure'

export const allProjectsStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('All projects')
    .icon(StarIcon)
    .id('all-projects')
    .child(S.document().schemaType('allProjects').documentId('allProjects'))
