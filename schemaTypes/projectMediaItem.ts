import {defineField, defineType} from 'sanity'

export const projectMediaItem = defineType({
  name: 'projectMediaItem',
  title: 'Image or file',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Type',
      type: 'string',
      initialValue: 'image',
      options: {
        layout: 'radio',
        list: [
          {title: 'Image', value: 'image'},
          {title: 'File', value: 'file'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.mediaType !== 'image',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {mediaType?: string} | undefined
          if (parent?.mediaType === 'image' && !value) {
            return 'Add an image'
          }
          return true
        }),
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Upload a file when not using a built-in image field (e.g. video).',
      hidden: ({parent}) => parent?.mediaType !== 'file',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {mediaType?: string} | undefined
          if (parent?.mediaType === 'file' && !value) {
            return 'Add a file'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: 'image',
    },
    prepare({mediaType, image}) {
      return {
        title: mediaType === 'file' ? 'File' : 'Image',
        media: image,
        subtitle: mediaType === 'file' ? 'File upload' : undefined,
      }
    },
  },
})
