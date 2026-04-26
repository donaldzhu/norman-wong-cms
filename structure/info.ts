import { InfoOutlineIcon } from '@sanity/icons'
import type { StructureBuilder } from 'sanity/structure'

export const infoStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('Info')
    .icon(InfoOutlineIcon)
    .id('singleton-info')
    .child(S.document().schemaType('info').documentId('info'))
