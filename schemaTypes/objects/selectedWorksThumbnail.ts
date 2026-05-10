import * as changeCase from 'change-case'
import { defineField, defineType } from 'sanity'

import { selectedWorkAsset } from '../../components/selectedWorkAsset'

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
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {
        sources: [selectedWorkAsset],
      },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
    }),
    //TODO merge with allProjectsThumbnail
    defineField({
      name: 'video',
      type: 'mux.video',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
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
