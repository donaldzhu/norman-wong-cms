import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'

/** One row of Selected Works thumbnails; cell count is set when the row is created (desktop 10–12, mobile 4–6). */
export const selectedWorksThumbnailRow = defineType({
  name: 'selectedWorksThumbnailRow',
  title: 'Thumbnail row',
  type: 'object',
  icon: ProjectsIcon,
  fields: [
    defineField({
      name: 'cells',
      title: 'Cells',
      type: 'array',
      of: [{ type: 'selectedWorksThumbnail' }],
    }),
  ],
  preview: {
    select: { cells: 'cells' },
    prepare({ cells }) {
      const n = Array.isArray(cells) ? cells.length : 0
      return { title: 'Row', subtitle: n ? `${n} cell${n > 1 ? 's' : ''}` : 'Empty row' }
    },
  },
})
