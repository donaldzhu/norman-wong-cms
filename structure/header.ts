import {ComposeIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'

export function headerStructure(S: StructureBuilder) {
  return S.listItem()
    .title('Header')
    .icon(ComposeIcon)
    .id('singleton-header')
    .child(S.document().schemaType('header').documentId('header'))
}
