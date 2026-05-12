import { muxVideoAssetRefsFromProject, toRemove_assetRefsFromProject } from './refs'

import { ButtonToggleInput } from '../components/buttonToggleInput'
import { MediaType } from '../constants/enum'
import { allProjectsAssetSource } from '../components/projectAssetPicker'
import { defineField } from 'sanity'

export const mediaTypeField = () => {
  return [
    defineField({
      name: 'mediaType',
      type: 'string',
      initialValue: MediaType.IMAGE,
      components: { input: ButtonToggleInput },
      options: {
        list: [
          { title: 'Image', value: MediaType.IMAGE },
          { title: 'Video', value: MediaType.VIDEO },
        ],
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: MediaType.IMAGE,
      type: 'image',
      options: {
        sources: [allProjectsAssetSource],
        disableNew: true,
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.IMAGE,
      validation: rule =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== MediaType.IMAGE) return true
          if (!value) return 'Add an image'
          const img = value as { asset?: { _ref?: string } }
          const ref = img?.asset?._ref
          if (!ref) return 'Add an image'
          const doc = context.document as { slides?: unknown } | undefined
          const allowed = new Set(toRemove_assetRefsFromProject(doc?.slides))
          if (!allowed.has(ref)) {
            return 'The image thumbnail must appear within the project.'
          }
          return true
        }),

    }),
    defineField({
      name: MediaType.VIDEO,
      type: 'mux.video',
      hidden: ({ parent }) => parent?.mediaType !== MediaType.VIDEO,
      validation: rule =>
        rule.custom(async (value: unknown, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== MediaType.VIDEO) return true
          const mux = value as { asset?: { _ref?: string } } | null | undefined
          if (!mux?.asset?._ref) return 'Add a video'
          const doc = context.document as { slides?: unknown } | undefined
          const allowed = new Set(muxVideoAssetRefsFromProject(doc?.slides))
          if (!allowed.has(mux.asset._ref))
            return 'The video thumbnail must appear within the project.'
          return true
        }),
    })]
}