import { defineField, defineType } from 'sanity'

export const videoObject = defineType({
  name: 'videoObject',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'video',
      type: 'mux.video',
      validation: rule => rule.required(),
    }),
  ],
})
