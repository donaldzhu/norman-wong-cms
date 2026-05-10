import * as changeCase from 'change-case'
import { defineField, defineType } from 'sanity'

import { SelectedWorksProjectMuxFieldInput } from '../../components/selectedWorksProjectMuxFieldInput'
import { selectedWorksProjectSlideImageAsset } from '../../components/selectedWorksProjectSlideImageAsset'

/** Same shape as `allProjectsThumbnail`; image/video pickers are scoped to the parent block’s Project reference. */
export const selectedWorksProjectMedia = defineType({
  name: 'selectedWorksProjectMedia',
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
        sources: [selectedWorksProjectSlideImageAsset],
        disableNew: true,
      },
      hidden: ({ parent }) => parent?.type !== 'image',
      validation: rule =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined
          if (parent?.type !== 'image') return true
          if (!value) return 'Add an image'
          const img = value as { asset?: { _ref?: string } }
          if (!img?.asset?._ref) return 'Add an image'
          return true
        }),
    }),
    defineField({
      name: 'video',
      type: 'mux.video',
      components: {
        input: SelectedWorksProjectMuxFieldInput,
      },
      hidden: ({ parent }) => parent?.type !== 'video',
      validation: rule =>
        rule.custom((value: unknown, context) => {
          const parent = context.parent as { type?: string } | undefined
          if (parent?.type !== 'video') return true
          const mux = value as { asset?: { _ref?: string } } | null | undefined
          if (!mux?.asset?._ref) return 'Add a video'
          return true
        }),
    }),
    defineField({
      name: 'desktopSize',
      type: 'string',
      initialValue: 's',
      hidden: true,
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
      hidden: true,
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
      type: 'type',
      image: 'image',
      video: 'video',
    },
    prepare({ type, image, video }) {
      const t = type ?? 'image'
      return {
        title: changeCase.capitalCase(t),
        media: t === 'video' ? video : image,
      }
    },
  },
})
