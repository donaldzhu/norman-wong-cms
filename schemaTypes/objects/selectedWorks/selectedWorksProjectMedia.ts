import * as changeCase from 'change-case'

import { defineField, defineType } from 'sanity'

import { MediaType } from '../../../constants/enum'
import { SelectedWorksProjectMuxFieldInput } from '../../../components/selectedWorks/selectedWorksProjectMuxFieldInput'
import { selectedWorksProjectSlideImageAsset } from '../../../components/selectedWorks/selectedWorksProjectSlideImageAsset'

export const selectedWorksProjectMedia = defineType({
  name: 'selectedWorksProjectMedia',
  title: 'Image or file',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      type: 'string',
      initialValue: MediaType.IMAGE,
      options: {
        layout: 'radio',
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
        sources: [selectedWorksProjectSlideImageAsset],
        disableNew: true,
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.IMAGE,
      validation: rule =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== MediaType.IMAGE) return true
          if (!value) return 'Add an image'
          const img = value as { asset?: { _ref?: string } }
          if (!img?.asset?._ref) return 'Add an image'
          return true
        }),
    }),
    defineField({
      name: MediaType.VIDEO,
      type: 'mux.video',
      components: {
        input: SelectedWorksProjectMuxFieldInput,
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.VIDEO,
      validation: rule =>
        rule.custom((value: unknown, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== MediaType.VIDEO) return true
          const mux = value as { asset?: { _ref?: string } } | null | undefined
          if (!mux?.asset?._ref) return 'Add a video'
          return true
        }),
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: MediaType.IMAGE,
      video: MediaType.VIDEO,
    },
    prepare({ mediaType, image, video }) {
      const t = mediaType ?? MediaType.IMAGE
      return {
        title: changeCase.capitalCase(t),
        media: t === MediaType.VIDEO ? video : image,
      }
    },
  },
})
