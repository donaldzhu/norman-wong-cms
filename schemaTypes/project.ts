import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'
import { italicTextBlock } from './definitions/italicText'
import { plainTextFromBlocks } from '../utils/common'

//TODO
export const project = defineType({
  name: 'project',
  type: 'document',
  icon: ProjectsIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'array',
      of: [italicTextBlock],
      validation: rule => rule.required().max(1),
    }),
    defineField({
      name: 'slides',
      title: 'Project slides',
      type: 'array',
      of: [{ type: 'projectSlide' }],
    }),
    defineField({
      name: 'allProjectsThumbnails',
      title: '"All Projects" Thumbnails',
      type: 'array',
      of: [{ type: 'allProjectsThumbnail' }],
      validation: rule => rule.min(1).max(10),
    }),
    defineField({
      name: 'hidden',
      title: 'Hide Project',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      allProjectsThumbnails: 'allProjectsThumbnails',
    },
    prepare({ title, allProjectsThumbnails }) {
      const text = plainTextFromBlocks(title) || 'Untitled'
      return {
        title: text,
        media: allProjectsThumbnails?.[0]?.image,
      }
    },
  },
})
