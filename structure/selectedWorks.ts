import {StarIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'

export function selectedWorksStructure(S: StructureBuilder) {
  return S.listItem()
    .title('Selected Works')
    .icon(StarIcon)
    .id('singleton-selected-works')
    .child(S.document().schemaType('selectedWorks').documentId('selectedWorks'))
}
