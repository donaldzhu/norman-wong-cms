import { ListIcon } from '@sanity/icons'
import type { StructureBuilder } from 'sanity/structure'

export const selectedWorksStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('Selected Works')
    .icon(ListIcon)
    .id('selected-works')
    .child(
      S.document()
        .schemaType('selectedWorks')
        .documentId('selectedWorks')
        .title('Selected Works'),
    )
