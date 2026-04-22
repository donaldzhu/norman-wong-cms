import {defineField, defineType} from 'sanity'
import {ComposeIcon} from '@sanity/icons'

export const header = defineType({
  name: 'header',
  title: 'Header',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'nameDisplayText',
      title: '"Name" display text',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'selectedWorksDisplayText',
      title: '"Selected Works" display text',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'allProjectsDisplayText',
      title: '"All Projects" display text',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'informationDisplayText',
      title: '"Information" display text',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
  ],
})
