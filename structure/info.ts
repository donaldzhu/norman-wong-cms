import {InfoOutlineIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'

export function infoStructure(S: StructureBuilder) {
  return S.listItem()
    .title('Info')
    .icon(InfoOutlineIcon)
    .id('singleton-info')
    .child(S.document().schemaType('info').documentId('info'))
}
