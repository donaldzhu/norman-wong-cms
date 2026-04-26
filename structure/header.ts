import { ComposeIcon } from '@sanity/icons'
import type { StructureBuilder } from 'sanity/structure'

export const headerStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('Header')
    .icon(ComposeIcon)
    .id('singleton-header')
    .child(S.document().schemaType('header').documentId('header'))
