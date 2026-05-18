import { defineField, defineType } from 'sanity'

import { ComposeIcon } from '@sanity/icons'

export const header = defineType({
  name: 'header',
  type: 'document',
  icon: ComposeIcon,
  groups: [
    {
      name: 'desktop',
      title: 'Desktop',
      default: true,
    },
    {
      name: 'mobile',
      title: 'Mobile',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'nameDisplayTextDesktop',
      title: '"Name" display text (Desktop)',
      type: 'string',
      validation: rule => rule.required(),
      group: 'desktop',
    }),
    defineField({
      name: 'selectedWorksDisplayTextDesktop',
      title: '"Selected Works" display text (Desktop)',
      type: 'string',
      validation: rule => rule.required(),
      group: 'desktop',
    }),
    defineField({
      name: 'allProjectsDisplayTextDesktop',
      title: '"All Projects" display text (Desktop)',
      type: 'string',
      validation: rule => rule.required(),
      group: 'desktop',
    }),
    defineField({
      name: 'informationDisplayTextDesktop',
      title: '"Information" display text (Desktop)',
      type: 'string',
      validation: rule => rule.required(),
      group: 'desktop',
    }),
    defineField({
      name: 'nameDisplayTextMobile',
      title: '"Name" display text (Mobile)',
      type: 'string',
      validation: rule => rule.required(),
      group: 'mobile',
    }),
    defineField({
      name: 'selectedWorksDisplayTextMobile',
      title: '"Selected Works" display text (Mobile)',
      type: 'string',
      validation: rule => rule.required(),
      group: 'mobile',
    }),
    defineField({
      name: 'allProjectsDisplayTextMobile',
      title: '"All Projects" display text (Mobile)',
      type: 'string',
      validation: rule => rule.required(),
      group: 'mobile',
    }),
    defineField({
      name: 'informationDisplayTextMobile',
      title: '"Information" display text (Mobile)',
      type: 'string',
      validation: rule => rule.required(),
      group: 'mobile',
    }),
  ],
})
