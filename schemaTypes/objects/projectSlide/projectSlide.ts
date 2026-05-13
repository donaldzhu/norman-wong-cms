import { defineField, defineType } from 'sanity'

import { ProjectSlidePreview } from '../../../components/previews/projectSlidePreview'

export const projectSlide = defineType({
  name: 'projectSlide',
  type: 'object',
  components: { preview: ProjectSlidePreview },
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
      /** Not `media` — that key is reserved for the preview thumbnail slot and breaks DefaultPreview. */
      slideMedia: 'media',
    },
  },
})
