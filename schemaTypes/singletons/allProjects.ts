import { defineField, defineType } from 'sanity'

import { StarIcon } from '@sanity/icons'

export const allProjects = defineType({
  name: 'allProjects',
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
      of: [{ type: 'allProjectsProject' }],
    }),
    defineField({
      name: 'desktopLayout',
      type: 'allProjectsLayout',
      options: { min: 10, max: 12 },
    }),
    defineField({
      name: 'mobileLayout',
      type: 'allProjectsLayout',
      options: { min: 2, max: 4 },
    }),
  ],
})
