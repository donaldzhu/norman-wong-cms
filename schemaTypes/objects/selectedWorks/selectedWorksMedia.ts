import { defineField, defineType } from 'sanity'

import { SelectedWorksProjectContext } from '../../../components/selectedWorks/selectedWorksContextProvider'
import { createToggleMediaFields } from '../../../utils/field'

export const selectedWorksMedia = defineType({
  name: 'selectedWorksMedia',
  type: 'object',
  fields: [
    ...createToggleMediaFields(SelectedWorksProjectContext),
    defineField({
      name: 'hideOnMobile',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
