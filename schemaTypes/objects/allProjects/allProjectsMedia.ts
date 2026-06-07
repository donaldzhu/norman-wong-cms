import { defineField, defineType } from 'sanity'

import { AllProjectsProjectMediaPreview } from '../../../components/previews/allProjectsProjectMediaPreview'
import { AllProjectsProjectContext } from '../../../components/allProjects/allProjectsContextProvider'
import { createToggleMediaFields } from '../../../utils/field'

export const allProjectsMedia = defineType({
  name: 'allProjectsMedia',
  type: 'object',
  components: {
    preview: AllProjectsProjectMediaPreview,
  },
  fields: [
    ...createToggleMediaFields(AllProjectsProjectContext),
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
