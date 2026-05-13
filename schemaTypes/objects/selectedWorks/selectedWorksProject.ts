import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'
import { SelectedWorksProjectBlockInput } from '../../../components/selectedWorks/selectedWorksProjectBlockInput'

export const selectedWorksProject = defineType({
  name: 'selectedWorksProject',
  title: 'Project block',
  type: 'object',
  icon: ProjectsIcon,
  components: {
    input: SelectedWorksProjectBlockInput,
  },
  fields: [
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'project' }],
      weak: true,
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [{ type: 'selectedWorksProjectMedia' }],
    }),
  ],
  preview: {
    select: { media: 'media', projectTitle: 'project.title' },
    prepare({ media, projectTitle }) {
      const n = Array.isArray(media) ? media.length : 0
      return {
        title: projectTitle || 'Project block',
        subtitle: n ? `${n} item${n === 1 ? '' : 's'}` : 'No media',
      }
    },
  },
})
