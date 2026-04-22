import {defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons'

export const selectedWorks = defineType({
  name: 'selectedWorks',
  title: 'Selected Works',
  type: 'document',
  icon: StarIcon,
  description: 'Featured images and files for the Selected Works page.',
  fields: [
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [{type: 'projectMediaItem'}],
      description: 'Ordered images or file uploads.',
    }),
  ],
})
