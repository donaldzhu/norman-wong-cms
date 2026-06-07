import { defineArrayMember, defineField, defineType } from 'sanity'

import { AllProjectsGridButton } from '../../../components/allProjects/allProjectsGridButton'
import { UnnestedField } from '../../../components/common/unnestedField'

export const allProjectsLayout = defineType({
  name: 'allProjectsLayout',
  title: 'All projects layout',
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
    input: AllProjectsGridButton,
    field: UnnestedField,
  },
})
