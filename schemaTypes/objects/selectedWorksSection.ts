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
      name: 'desktopThumbnails',
      title: 'Desktop Thumbnails',
      description: '10-12 thumbnails for the section',
      type: 'array',
      of: [{ type: 'selectedWorksThumbnail' }],
      // TODO 10–12
      validation: rule => rule.min(1).max(12),
    }),
    defineField({
      name: 'mobileThumbnails',
      title: 'Mobile Thumbnails',
      description: '4-6 thumbnails for the section',
      type: 'array',
      of: [{ type: 'selectedWorksThumbnail' }],
      // TODO 4–6
      validation: rule => rule.min(1).max(6)
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
