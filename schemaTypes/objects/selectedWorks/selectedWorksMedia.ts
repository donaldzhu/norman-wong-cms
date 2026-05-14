import { SelectedWorksProjectContext } from '../../../components/selectedWorks/selectedWorksContextProvider'
import { createToggleMediaFields } from '../../../utils/field'
import { defineType } from 'sanity'

export const selectedWorksMedia = defineType({
  name: 'selectedWorksProjectMedia',
  title: 'Image or file',
  type: 'object',
  fields: createToggleMediaFields(SelectedWorksProjectContext),
})
