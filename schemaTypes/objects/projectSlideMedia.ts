import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'

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
      name: 'desktopStart',
      title: 'Desktop Start Column',
      type: 'number',
      initialValue: 11,
      validation: rule => rule.required().min(1).max(23),
    }),
    defineField({
      name: 'desktopEnd',
      title: 'Desktop End Column',
      type: 'number',
      initialValue: 14,
      validation: rule => rule.required().min(2).max(24),
    }),
    defineField({
      name: 'automaticMobileLayout',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'mobileOrientation',
      type: 'string',
      initialValue: 'row',
      options: {
        layout: 'dropdown',
        list: [
          { title: 'row', value: 'row' },
          { title: 'column', value: 'column' },
        ],
      },
      hidden: ({ parent }) => parent?.automaticMobileLayout,
    }),
    defineField({
      name: 'mobileStart',
      title: 'Mobile Start Column',
      type: 'number',
      initialValue: 11,
      validation: rule => rule.min(1).max(23), // TODO
      hidden: ({ parent }) => parent?.automaticMobileLayout,
    }),
    defineField({
      name: 'mobileEnd',
      title: 'Mobile End Column',
      type: 'number',
      initialValue: 14,
      validation: rule => rule.min(2).max(24),
      hidden: ({ parent }) => parent?.automaticMobileLayout,
    }),
  ],


})
