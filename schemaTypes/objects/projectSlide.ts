import { defineField, defineType } from 'sanity'

import type { PreviewValue } from '@sanity/types'
import { italicTextBlock } from '../definitions/italicText'
import { plainTextFromBlocks } from '../../utils/common'

export const projectSlide = defineType({
  name: 'projectSlide',
  type: 'object',
  fields: [
    defineField({
      name: 'media',
      type: 'array',
      of: [{ type: 'projectSlideMedia' }],
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
      if (Array.isArray(media) && media.length > 0) subtitleParts.push(`${media.length} media`)

      const first: { _type?: string; mediaType?: string; image?: unknown } | undefined = media?.[0]
      const listMedia: PreviewValue['media'] =
        first?._type === 'imageObject'
          ? (first.image as PreviewValue['media'])
          : first?._type === 'projectMediaItem' && first.mediaType === 'image'
            ? (first.image as PreviewValue['media'])
            : undefined
      return {
        title: 'Slide',
        subtitle: subtitleParts.length ? subtitleParts.join(' · ') : undefined,
        media: listMedia,
      }
    },
  },
})
