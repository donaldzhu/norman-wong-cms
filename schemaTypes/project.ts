import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'
import { italicTextBlock } from './definitions/italicText'
import { plainTextFromBlocks } from '../utils/common'
import { slideImageAssetRefsFromSlides } from '../utils/slideImageAssetRefs'

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
      validation: rule =>
        rule.custom((items, context) => {
          const doc = context.document as { slides?: unknown } | undefined
          const allowed = new Set(slideImageAssetRefsFromSlides(doc?.slides))
          if (!Array.isArray(items)) return true
          for (const item of items) {
            const row = item as {
              mediaType?: string
              image?: { asset?: { _ref?: string } }
            }
            if (row.mediaType !== 'image') continue
            const ref = row.image?.asset?._ref
            if (!ref) continue
            if (!allowed.has(ref)) return 'Listing images must use an asset that appears in Project slides.'
          }
          return true
        }),
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
