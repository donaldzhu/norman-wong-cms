import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'
import { italicTextBlock } from './definitions/italicText'

function plainTextFromBlocks(blocks: unknown): string {
  if (!Array.isArray(blocks)) return ''
  const parts: string[] = []
  for (const block of blocks) {
    if (
      block &&
      typeof block === 'object' &&
      (block as { _type?: string })._type === 'block' &&
      Array.isArray((block as { children?: unknown }).children)
    ) {
      for (const child of (block as { children: { text?: string }[] }).children) {
        if (child?.text) parts.push(child.text)
      }
    }
  }
  return parts.join('').trim()
}

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'array',
      of: [italicTextBlock],
      validation: Rule => Rule.required().max(1)
    },
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [italicTextBlock],

    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.integer()
    }),
    defineField({
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [{ type: 'projectMediaItem' }],
      description: 'Ordered media items for this project.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      media: 'media',
    },
    prepare({ title, year, media }) {
      const text = plainTextFromBlocks(title) || 'Untitled'
      return {
        title: text,
        subtitle: year != null ? String(year) : undefined,
        media: media?.[0]?.image,
      }
    },
  },
})
