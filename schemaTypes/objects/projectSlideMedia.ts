import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'

const columnList = new Array(24)
  .fill(0)
  .map((_, index) => ({ title: String(index + 1), value: String(index + 1) }))

export const projectSlideMedia = defineType({
  name: 'projectSlideMedia',
  type: 'object',
  icon: ProjectsIcon,
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

      hidden: ({ parent }) => parent?.type !== 'image',
    }),
    defineField({
      name: 'video',
      type: 'mux.video',
      hidden: ({ parent }) => parent?.type !== 'video'
    }),
    defineField({
      name: 'startColumn',
      type: 'string',
      initialValue: 'auto',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'auto', value: 'auto' },
          ...columnList.slice(0, -1),
        ],
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'endColumn',
      type: 'string',
      initialValue: 'auto',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'auto', value: 'auto' },
          ...columnList.slice(1),
        ],
      },
      validation: rule => rule.required(),
    }),
  ],

})
