import * as changeCase from 'change-case'
import { defineField, defineType } from 'sanity'
import { mediaAssetSource } from 'sanity-plugin-media'

import { referencedProjectSlideImagesAssetSource } from '../../components/referencedProjectSlideImagesAssetSource'
import { SelectedWorksThumbnailImageInput } from '../../components/selectedWorksThumbnailImageInput'
import {
  type FormPathSegment,
  getValueAtFormPath,
  publishedAndDraftIdsFromRef,
  selectedWorksSectionPathFromFieldPath,
} from '../../utils/selectedWorksSectionPath'
import { assetRefsFromProject } from '../../utils/refs'

/** Thumbnail row for Selected Works: no size tier (that exists only on All Projects thumbnails). */
export const selectedWorksThumbnail = defineType({
  name: 'selectedWorksThumbnail',
  title: 'Image or file',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Type',
      type: 'string',
      initialValue: 'image',
      options: {
        layout: 'radio',
        list: [
          { title: 'Image', value: 'image' },
          { title: 'File', value: 'file' },
        ],
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      components: {
        input: SelectedWorksThumbnailImageInput,
      },
      options: {
        hotspot: true,
        sources: [referencedProjectSlideImagesAssetSource],
      },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: Rule =>
        Rule.custom(async (image, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== 'image') return true
          if (!image?.asset?._ref) return 'Add an image'
          const path = context.path as FormPathSegment[] | undefined
          const sectionPath = path ? selectedWorksSectionPathFromFieldPath(path) : null
          if (!sectionPath?.length) return true

          const doc = context.document as Record<string, unknown> | undefined
          if (!doc) return true
          const project = getValueAtFormPath(doc, [...sectionPath, 'project']) as
            | { _ref?: string }
            | undefined
          const ref = project?._ref
          if (!ref) return 'Select a project for this section before adding slide images.'
          const client = context.getClient({ apiVersion: '2024-01-01' })
          const ids = publishedAndDraftIdsFromRef(ref)
          const slides = await client.fetch(`*[_id in $ids][0].slides`, { ids })
          const allowed = new Set(assetRefsFromProject(slides))
          if (!allowed.has(image.asset._ref)) {
            return 'This image must appear on the selected project’s slides.'
          }
          return true
        }),
    }),
    defineField({
      name: 'file',
      type: 'file',
      options: {
        sources: [mediaAssetSource],
      },
      description: 'Choose a file from Media (e.g. video).',
      hidden: ({ parent }) => parent?.mediaType !== 'file',
      validation: Rule =>
        Rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'file' && !value) return 'Add a file'
          return true
        }),
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: 'image',
    },
    prepare({ mediaType, image }) {
      return {
        title: changeCase.capitalCase(mediaType ?? 'image'),
        media: image,
      }
    },
  },
})
