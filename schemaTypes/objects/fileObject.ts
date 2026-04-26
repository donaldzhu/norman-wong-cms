import { defineField, defineType } from 'sanity'

import { mediaAssetSource } from 'sanity-plugin-media'

export const fileObject = defineType({
  name: 'fileObject',
  title: 'File',
  type: 'object',
  fields: [
    defineField({
      name: 'file',
      type: 'file',
      options: {
        sources: [mediaAssetSource],
      },
      validation: rule => rule.required(),
    }),
  ],
  preview: {
    select: {
      file: 'file',
    },
    prepare({ file }) {
      return {
        title: 'File',
        media: file,
      }
    },
  },
})
