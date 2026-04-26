import { defineField, defineType } from 'sanity'

import { ListIcon } from '@sanity/icons'

export const allProjects = defineType({
  name: 'allProjects',
  type: 'document',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'projects',
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
