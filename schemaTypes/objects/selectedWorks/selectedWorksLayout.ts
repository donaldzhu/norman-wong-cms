import { defineArrayMember, defineField, defineType } from 'sanity'

import { SelectedWorksGridButton } from '../../../components/selectedWorks/selectedWorksGridButton'
import { UnnestedField } from '../../../components/common/unnestedField'

export const selectedWorksLayout = defineType({
  name: 'selectedWorksLayout',
  title: 'Selected works layout',
  type: 'object',
  fields: [
    defineField({
      name: 'rowSettings',
      title: 'Row cell counts',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'number',
          validation: rule => rule.required().integer().positive(),
        }),
      ],
      components: {
        input: () => null,
        field: () => null,
      },
    }),
  ],
  components: {
    input: SelectedWorksGridButton,
    field: UnnestedField,
  },
})
