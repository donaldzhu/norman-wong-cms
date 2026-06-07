import { defineField, defineType } from 'sanity'

import { ProjectsIcon } from '@sanity/icons'
import { AllProjectsProjectRefPreview } from '../../../components/previews/allProjectsProjectRefPreview'
import { AllProjectsProjectInput } from '../../../components/allProjects/allProjectsContextProvider'

export const allProjectsProject = defineType({
  name: 'allProjectsProject',
  type: 'object',
  icon: ProjectsIcon,
  components: {
    preview: AllProjectsProjectRefPreview,
    input: AllProjectsProjectInput,
  },
  fields: [
    defineField({
      name: 'project',
      type: 'reference',
      to: [{ type: 'project' }],
      weak: true,
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'media',
      type: 'array',
      of: [{ type: 'allProjectsMedia' }],
      validation: rule => rule.required(),
    }),
  ],
  preview: {
    select: {
      media: 'media',
      title: 'project.title'
    },
  },
})
