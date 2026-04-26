import { defineField, defineType } from 'sanity'

import { InfoOutlineIcon } from '@sanity/icons'

export const info = defineType({
  name: 'info',
  type: 'document',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'contacts',
      type: 'array',
      of: [{ type: 'contact' }],
    }),
  ],
})
