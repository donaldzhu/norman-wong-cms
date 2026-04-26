import * as changeCase from 'change-case'

import { defineField, defineType } from 'sanity'

import { mediaAssetSource } from 'sanity-plugin-media'
import { slideImagesAssetSource } from '../../components/slideImagesAssetSource'

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
          { title: 'File', value: 'file' },
        ],
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
        sources: [slideImagesAssetSource],
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
      name: 'file',
      type: 'file',
      options: {
        sources: [mediaAssetSource],
      },
      description: 'Choose a file from Media (e.g. video).',
      hidden: ({ parent }) => parent?.mediaType !== 'file',
      validation: rule =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'file' && !value) return 'Add a file'
          return true
        }),
    }),

  ],
  preview: {
    select: {
      size: 'size',
      mediaType: 'mediaType',
      image: 'image',
    },
    prepare({ size, mediaType, image }) {
      return {
        title: changeCase.capitalCase(mediaType ?? 'image'),
        media: image,
        subtitle: size ? changeCase.capitalCase(size) : undefined,
      }
    },
  },
})
