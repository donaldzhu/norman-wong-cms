import { defineField, defineType } from 'sanity'

import { StarIcon } from '@sanity/icons'

export const selectedWorks = defineType({
  name: 'selectedWorks',
  type: 'document',
  icon: StarIcon,
  description: 'Featured images and files for the Selected Works page.',
  // @ts-expect-error
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'media',
      type: 'array',
      of: [{ type: 'projectMediaItem' }],
    }),
  ],
})
