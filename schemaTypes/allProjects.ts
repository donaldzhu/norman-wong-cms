import { defineField, defineType } from 'sanity'

import { ListIcon } from '@sanity/icons'

export const allProjects = defineType({
  name: 'allProjects',
  title: 'All projects',
  type: 'document',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }],
        },
      ],
    }),
  ],
})
