import { defineField, defineType } from 'sanity'

import { AllProjectsProjectContext } from '../../../components/allProjects/allProjectsContextProvider'
import { AllProjectsProjectMediaPreview } from '../../../components/previews/allProjectsProjectMediaPreview'
import { createToggleMediaFields } from '../../../utils/field'

export const allProjectsMedia = defineType({
  name: 'allProjectsMedia',
  type: 'object',
  components: {
    preview: AllProjectsProjectMediaPreview,
  },
  fields: [
    ...createToggleMediaFields({ context: AllProjectsProjectContext }),
    defineField({
      name: 'hideOnMobile',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: 'image',
      video: 'video',
      hideOnMobile: 'hideOnMobile',
    },
  },
})
