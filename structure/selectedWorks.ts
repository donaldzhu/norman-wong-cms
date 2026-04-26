import { StarIcon } from '@sanity/icons'
import type { StructureBuilder } from 'sanity/structure'

export const selectedWorksStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('Selected Works')
    .icon(StarIcon)
    .id('singleton-selected-works')
    .child(S.document().schemaType('selectedWorks').documentId('selectedWorks'))

