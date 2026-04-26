import * as changeCase from 'change-case'

import { defineField, defineType } from 'sanity'

import { allProjectsAssetSource } from '../../components/allProjectsAsset'
import { muxVideoAssetRefsFromProject } from '../../utils/refs'

export const allProjectsThumbnail = defineType({
  name: 'allProjectsThumbnail',
  title: 'Image or file',
  type: 'object',
  fields: [
    defineField({
      name: 'size',
      type: 'string',
      initialValue: 'small',
      options: {
        layout: 'radio',
        list: [
          { title: 'Small', value: 'small' },
          { title: 'Medium', value: 'medium' },
          { title: 'Large', value: 'large' },
        ],
      },
    }),
    defineField({
      name: 'mediaType',
      title: 'Type',
      type: 'string',
      initialValue: 'image',
      options: {
        layout: 'radio',
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
        sources: [allProjectsAssetSource],
      },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: rule =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'image' && !value) return 'Add an image'

          return true
        }),
    }),
    defineField({
      name: 'video',
      type: 'mux.video',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: rule =>
        rule.custom(async (value: unknown, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== 'video') return true
          const mux = value as { asset?: { _ref?: string } } | null | undefined
          if (!mux?.asset?._ref) return 'Add a video'
          const doc = context.document as { slides?: unknown } | undefined
          const allowed = new Set(muxVideoAssetRefsFromProject(doc?.slides))
          if (!allowed.has(mux.asset._ref)) {
            return 'This video must appear on this document’s project slides.'
          }
          return true
        }),
    }),

  ],
  preview: {
    select: {
      size: 'size',
      mediaType: 'mediaType',
    },
    prepare({ size, mediaType }) {
      return {
        title: changeCase.capitalCase(mediaType ?? 'image'),
        subtitle: size ? changeCase.capitalCase(size) : undefined,
      }
    },
  },
})
