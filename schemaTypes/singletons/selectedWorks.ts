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
      name: 'projects',
      type: 'array',
      of: [{ type: 'selectedWorksProject' }],
    }),
    defineField({
      name: 'desktopLayout',
      type: 'selectedWorksLayout',
      options: { min: 10, max: 12 },
    }),
    defineField({
      name: 'mobileLayout',
      type: 'selectedWorksLayout',
      options: { min: 3, max: 5 },
    }),
  ],
})
