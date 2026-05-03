import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'

//TODO
export const project = defineType({
  name: 'project',
  type: 'document',
  icon: ProjectsIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: rule => rule.required().max(100),
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      validation: rule => rule.max(100),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: rule => rule.required(),
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
      return {
        title,
        media: allProjectsThumbnails?.[0]?.image,
      }
    },
  },
})
