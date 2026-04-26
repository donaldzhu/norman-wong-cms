import { defineField, defineType } from 'sanity'

import { italicTextBlock } from './definitions/italicText'
import { plainTextFromBlocks } from '../utils/common'

export const projectSlide = defineType({
  name: 'projectSlide',
  type: 'object',
  fields: [
    defineField({
      name: 'media',
      type: 'array',
      of: [{ type: 'projectMediaItem' }],
      validation: rule => rule.required().min(1).max(3),
    }),
    defineField({
      name: 'description',
      type: 'array',
      of: [italicTextBlock],
      validation: rule => rule.required().min(1).max(1),
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
      media: 'media',
    },
    prepare({ description, year, media }) {
      const subtitleParts: string[] = []
      const desc = plainTextFromBlocks(description)
      if (desc) subtitleParts.push(desc)
      if (year != null) subtitleParts.push(String(year))
      const count = Array.isArray(media) ? media.length : 0
      if (count > 0) subtitleParts.push(`${count} media`)
      return {
        title: 'Slide',
        subtitle: subtitleParts.length ? subtitleParts.join(' · ') : undefined,
        media: media?.[0]?.image,
      }
    },
  },
})
