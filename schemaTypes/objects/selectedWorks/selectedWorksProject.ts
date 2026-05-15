import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'
import { SelectedProjectRefPreview } from '../../../components/previews/selectedProjectRefPreview'
import { SelectedWorksProjectInput } from '../../../components/selectedWorks/selectedWorksContextProvider'

export const selectedWorksProject = defineType({
  name: 'selectedWorksProject',
  type: 'object',
  icon: ProjectsIcon,
  components: {
    preview: SelectedProjectRefPreview,
    input: SelectedWorksProjectInput,
  },
  fields: [
    defineField({
      name: 'project',
      type: 'reference',
      to: [{ type: 'project' }],
      weak: true,
    }),
    defineField({
      name: 'media',
      type: 'array',
      of: [{ type: 'selectedWorksMedia' }],
    }),
  ],
  preview: {
    select: {
      media: 'media',
      title: 'project.title'
    },
  },
})
