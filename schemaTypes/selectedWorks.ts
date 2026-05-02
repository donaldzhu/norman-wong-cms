import { defineField, defineType } from 'sanity'

import { StarIcon } from '@sanity/icons'

export const selectedWorks = defineType({
  name: 'selectedWorks',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'sections',
      type: 'array',
      of: [{ type: 'selectedWorksSection' }]
    }),

  ],
})
