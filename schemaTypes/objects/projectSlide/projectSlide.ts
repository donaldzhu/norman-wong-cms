import { defineField, defineType } from 'sanity'

import { Orientation } from '../../../constants/enum'
import { ProjectSlideObjectInput } from '../../../components/projectSlide/projectSlideObjectInput'
import { ProjectSlidesPreview } from '../../../components/previews/projectSlidesPreview'

export const projectSlide = defineType({
  name: 'projectSlide',
  type: 'object',
  components: { input: ProjectSlideObjectInput, preview: ProjectSlidesPreview },
  fields: [
    defineField({
      name: 'automaticMobileLayout',
      title: 'Automatic mobile layout',
      type: 'boolean',
      description:
        'When on, the front end lays out mobile for this slide. When off, set a mobile span for each media item in the slide grid planner.',
      initialValue: true,
      hidden: () => true,
    }),
    defineField({
      name: 'mobileOrientation',
      title: 'Mobile grid orientation',
      type: 'string',
      initialValue: Orientation.PORTRAIT,
      options: {
        layout: 'dropdown',
        list: [
          { title: 'Portrait', value: Orientation.PORTRAIT },
          { title: 'Landscape', value: Orientation.LANDSCAPE },
        ],
      },
      validation: rule => rule.required(),
      hidden: () => true,
    }),
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
