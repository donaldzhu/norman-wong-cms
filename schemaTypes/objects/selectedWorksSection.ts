import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'

export const selectedWorksSection = defineType({
  name: 'selectedWorksSection',
  type: 'object',
  icon: ProjectsIcon,
  fields: [
    defineField({
      name: 'project',
      type: 'reference',
      to: [{ type: 'project' }],
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'thumbnails',
      title: 'Thumbnails',
      type: 'array',
      of: [{ type: 'selectedWorksThumbnail' }],
    }),
  ],
  preview: {
    select: {
      projectId: 'project._ref',
      thumbs: 'thumbnails',
    },
    prepare({ projectId, thumbs }) {
      const n = Array.isArray(thumbs) ? thumbs.length : 0
      return {
        title: projectId ? `Project …${String(projectId).slice(-6)}` : 'Section',
        subtitle: n ? `${n} thumbnail${n > 1 ? 's' : ''}` : 'No thumbnails',
      }
    },
  },
})
