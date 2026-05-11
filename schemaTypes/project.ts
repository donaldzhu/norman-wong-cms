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
      description: 'This is the URL subpath for the project.',
      options: {
        source: doc => `${doc.title}${doc.subtitle ? `- ${doc.subtitle}` : ''}`.toLowerCase().replace(/ /g, '-'),
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
      validation: rule => rule.min(1).max(10), // TODO
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
      subtitle: 'subtitle',
      allProjectsThumbnails: 'allProjectsThumbnails',
    },
    prepare({ title, subtitle, allProjectsThumbnails }) {
      return {
        title,
        subtitle,
        media: allProjectsThumbnails?.[0]?.image,
      }
    },
  },
})
