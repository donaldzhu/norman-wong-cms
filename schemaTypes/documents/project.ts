import { defineField, defineType } from 'sanity'

import { DocumentIcon } from '@sanity/icons'

import { MediaType } from '../../constants/enum'
import { ProjectDocumentPreview } from '../../components/previews/projectDocumentPreview'
import { hasProjectGridConfigurationIssue } from '../../utils/projectGridIssue'

//TODO
export const project = defineType({
  name: 'project',
  type: 'document',
  icon: DocumentIcon,
  components: {
    preview: ProjectDocumentPreview,
  },
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: rule => rule.required().max(100),
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      validation: rule => rule.max(100),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'This is the URL subpath for the project.',
      options: {
        source: doc => `${doc.title}${doc.subtitle ? `- ${doc.subtitle}` : ''}`.toLowerCase().replace(/ /g, '-'),
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'slides',
      title: 'Project slides',
      type: 'array',
      of: [{ type: 'projectSlide' }],
    }),
    defineField({
      name: 'allProjectsThumbnails',
      title: '"All Projects" Thumbnails',
      type: 'array',
      of: [{ type: 'allProjectsThumbnail' }],
      validation: rule => rule.min(1).max(10), // TODO
    }),
    defineField({
      name: 'hidden',
      title: 'Hide Project',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      allProjectsThumbnails: 'allProjectsThumbnails',
      slides: 'slides',
    },
    prepare({
      title,
      subtitle,
      allProjectsThumbnails,
      slides,
    }) {
      const thumb = allProjectsThumbnails?.[0]
      const slideThumb = thumb?.image
        ? { mediaType: MediaType.IMAGE, image: thumb.image }
        : undefined

      return {
        title: title ?? 'Untitled',
        subtitle,
        slideThumb,
        hasGridIssue: hasProjectGridConfigurationIssue(slides),
      }
    },
  },
})
