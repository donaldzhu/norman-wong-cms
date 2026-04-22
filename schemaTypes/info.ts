import { defineField, defineType } from 'sanity'

import { InfoOutlineIcon } from '@sanity/icons'

export const info = defineType({
  name: 'info',
  title: 'Info',
  type: 'document',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'contacts',
      title: 'Contacts',
      type: 'array',
      of: [{ type: 'contact' }],
    }),
  ],
})
