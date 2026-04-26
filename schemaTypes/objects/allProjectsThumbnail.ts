import * as changeCase from 'change-case'

import { defineField, defineType } from 'sanity'

import { allProjectsAssetSource } from '../../components/allProjectsAsset'
import { mediaAssetSource } from 'sanity-plugin-media'

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
      /* options: {
        sources: [mediaAssetSource],
      }, */
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: rule =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'video' && !value) return 'Add a video'
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
