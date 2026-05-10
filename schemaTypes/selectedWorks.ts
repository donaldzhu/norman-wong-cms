import { defineField, defineType } from 'sanity'

import { SelectedWorksThumbnailRowsInput } from '../components/selectedWorksThumbnailRowsInput'
import { StarIcon } from '@sanity/icons'

export const selectedWorks = defineType({
  name: 'selectedWorks',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'desktopThumbnailRows',
      title: 'Desktop thumbnail rows',
      type: 'array',
      of: [{ type: 'selectedWorksThumbnailRow' }],
      components: {
        input: SelectedWorksThumbnailRowsInput,
      },
    }),
    defineField({
      name: 'mobileThumbnailRows',
      title: 'Mobile thumbnail rows',
      type: 'array',
      of: [{ type: 'selectedWorksThumbnailRow' }],
      components: {
        input: SelectedWorksThumbnailRowsInput,
      },
    }),

  ],
})
