import { defineField, defineType } from 'sanity'

import { ProjectSlidesPreview } from '../../../components/previews/projectSlidesPreview'

export const projectSlide = defineType({
  name: 'projectSlide',
  type: 'object',
  components: { preview: ProjectSlidesPreview },
  fields: [
    defineField({
      name: 'media',
      type: 'array',
      of: [{ type: 'projectSlideMedia' }],
      description: 'Maximum 4 images/videos.',
      validation: rule => rule.required().min(1).max(4),
    }),
    defineField({
      name: 'description',
      type: 'string',
      validation: rule => rule.max(200),
    }),
    defineField({
      name: 'year',
      type: 'number',
      validation: rule => rule.integer(),
    }),
  ],
  preview: {
    select: {
      description: 'description',
      year: 'year',
      slideMedia: 'media',
    },
  },
})
