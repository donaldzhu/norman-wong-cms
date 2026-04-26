import { defineField, defineType } from 'sanity'

import { ComposeIcon } from '@sanity/icons'

export const header = defineType({
  name: 'header',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'nameDisplayText',
      title: '"Name" display text',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'selectedWorksDisplayText',
      title: '"Selected Works" display text',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'allProjectsDisplayText',
      title: '"All Projects" display text',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'informationDisplayText',
      title: '"Information" display text',
      type: 'string',
      validation: rule => rule.required(),
    }),
  ],
})
