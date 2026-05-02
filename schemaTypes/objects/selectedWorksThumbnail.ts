import * as changeCase from 'change-case'
import { defineField, defineType } from 'sanity'

import { selectedWorkAsset } from '../../components/selectedWorkAsset'
import { SelectedWorksImageInput } from '../../components/selectedWorksSectionPathContext'
import { assetRefsFromProject, muxVideoAssetRefsFromProject } from '../../utils/refs'
import {
  type FormPathSegment,
  getValueAtFormPath,
  publishedAndDraftIdsFromRef,
  selectedWorksSectionPathFromFieldPath,
} from '../../utils/selectedWorksSectionPath'

/** Thumbnail row for Selected Works: no size tier (that exists only on All Projects thumbnails). */
export const selectedWorksThumbnail = defineType({
  name: 'selectedWorksThumbnail',
  title: 'Image or video',
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
          { title: 'Video', value: 'video' },
        ],
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      components: {
        input: SelectedWorksImageInput,
      },
      options: {
        sources: [selectedWorkAsset],
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
    //TODO merge with allProjectsThumbnail
    defineField({
      name: 'video',
      type: 'mux.video',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: Rule =>
        Rule.custom(async (value: unknown, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== 'video') return true
          const muxVideo = value as { asset?: { _ref?: string } } | null | undefined
          if (!muxVideo?.asset?._ref) return 'Add a video'
          const path = context.path as FormPathSegment[] | undefined
          const sectionPath = path ? selectedWorksSectionPathFromFieldPath(path) : null
          if (!sectionPath?.length) return true

          const doc = context.document as Record<string, unknown> | undefined
          if (!doc) return true
          const project = getValueAtFormPath(doc, [...sectionPath, 'project']) as
            | { _ref?: string }
            | undefined
          const ref = project?._ref
          if (!ref) return 'Select a project for this section before adding slide videos.'
          const client = context.getClient({ apiVersion: '2024-01-01' })
          const ids = publishedAndDraftIdsFromRef(ref)
          const slides = await client.fetch(`*[_id in $ids][0].slides`, { ids })
          const allowed = new Set(muxVideoAssetRefsFromProject(slides))
          if (!allowed.has(muxVideo.asset._ref)) {
            return 'This video must appear on the selected project’s slides.'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
    },
    prepare({ mediaType }) {
      return {
        title: changeCase.capitalCase(mediaType ?? 'image'),
      }
    },
  },
})
