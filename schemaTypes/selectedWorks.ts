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
      title: 'Projects',
      type: 'array',
      of: [{ type: 'selectedWorksProject' }],
    }),
    defineField({
      name: 'desktopLayout',
      title: 'Desktop layout',
      type: 'selectedWorksLayout',
    }),
    defineField({
      name: 'mobileLayout',
      title: 'Mobile layout',
      type: 'selectedWorksLayout',
    }),
  ],
})
