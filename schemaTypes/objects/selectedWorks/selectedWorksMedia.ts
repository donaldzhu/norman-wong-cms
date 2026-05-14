import { SelectedWorksProjectContext } from '../../../components/selectedWorks/selectedWorksContextProvider'
import { createToggleMediaFields } from '../../../utils/field'
import { defineType } from 'sanity'

export const selectedWorksMedia = defineType({
  name: 'selectedWorksMedia',
  type: 'object',
  fields: createToggleMediaFields(SelectedWorksProjectContext),
})
