import { defineField, defineType } from 'sanity'

import { mediaAssetSource } from 'sanity-plugin-media'

export const imageObject = defineType({
  name: 'imageObject',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
        sources: [mediaAssetSource],
      },
      validation: rule => rule.required(),
    }),
  ],
})
