import * as changeCase from 'change-case'

import { assetRefsFromProject, muxVideoAssetRefsFromProject } from '../../utils/refs'
import { defineField, defineType } from 'sanity'

import { allProjectsAssetSource } from '../../components/allProjectsAsset'

export const allProjectsThumbnail = defineType({
  name: 'allProjectsThumbnail',
  title: 'Image or file',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
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
        sources: [allProjectsAssetSource],
        disableNew: true,
      },
      hidden: ({ parent }) => parent?.type !== 'image',
      validation: rule =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined
          if (parent?.type !== 'image') return true
          if (!value) return 'Add an image'
          const img = value as { asset?: { _ref?: string } }
          const ref = img?.asset?._ref
          if (!ref) return 'Add an image'
          const doc = context.document as { slides?: unknown } | undefined
          const allowed = new Set(assetRefsFromProject(doc?.slides))
          if (!allowed.has(ref)) {
            return 'The image thumbnail must appear within the project.'
          }
          return true
        }),

    }),
    defineField({
      name: 'video',
      type: 'mux.video',
      hidden: ({ parent }) => parent?.type !== 'video',
      validation: rule =>
        rule.custom(async (value: unknown, context) => {
          const parent = context.parent as { type?: string } | undefined
          if (parent?.type !== 'video') return true
          const mux = value as { asset?: { _ref?: string } } | null | undefined
          if (!mux?.asset?._ref) return 'Add a video'
          const doc = context.document as { slides?: unknown } | undefined
          const allowed = new Set(muxVideoAssetRefsFromProject(doc?.slides))
          if (!allowed.has(mux.asset._ref))
            return 'The video thumbnail must appear within the project.'

          return true
        }),
    }),
    defineField({
      name: 'desktopSize',
      type: 'string',
      initialValue: 's',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'S', value: 's' },
          { title: 'M', value: 'm' },
          { title: 'L', value: 'l' },
        ],
      },
    }),
    defineField({
      name: 'mobileSize',
      type: 'string',
      initialValue: 's',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'S', value: 's' },
          { title: 'L', value: 'l' },
        ],
      },
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
