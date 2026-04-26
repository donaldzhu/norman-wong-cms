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
  preview: {
    select: { image: 'image' },
    prepare({ image }) {
      return {
        title: 'Image',
        media: image,
      }
    },
  },
})

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
      description: 'Choose a file from Media (e.g. video).',
      validation: rule => rule.required(),
    }),
  ],
  preview: {
    select: { filename: 'file.asset.originalFilename' },
    prepare({ filename }) {
      return {
        title: filename || 'File',
        subtitle: 'Video or other file',
      }
    },
  },
})
