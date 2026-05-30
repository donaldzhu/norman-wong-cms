import { defineField, defineType } from 'sanity'

import { SelectedProjectMediaPreview } from '../../../components/previews/selectedProjectMediaPreview'
import { SelectedWorksProjectContext } from '../../../components/selectedWorks/selectedWorksContextProvider'
import { createToggleMediaFields } from '../../../utils/field'

export const selectedWorksMedia = defineType({
  name: 'selectedWorksMedia',
  type: 'object',
  components: {
    preview: SelectedProjectMediaPreview,
  },
  fields: [
    ...createToggleMediaFields(SelectedWorksProjectContext),
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
