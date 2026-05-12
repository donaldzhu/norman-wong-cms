import { defineField, defineType } from 'sanity'

import { MediaType } from '../../constants/enum'
import { mediaAssetSource } from 'sanity-plugin-media'

export const imageObject = defineType({
  name: 'imageObject',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: MediaType.IMAGE,
      type: 'image',
      options: {
        sources: [mediaAssetSource],
      },
      validation: rule => rule.required(),
    }),
  ],
  preview: {
    select: {
      image: MediaType.IMAGE,
    },
    prepare({ image }) {
      return {
        title: 'Image',
        media: image,
      }
    },
  },
})
