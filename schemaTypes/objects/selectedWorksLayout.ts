import { defineArrayMember, defineField, defineType } from 'sanity'

import { SelectedWorksGridManagerInput } from '../../components/selectedWorksGridManagerInput'

/** Groups ordered projects + persisted row widths for the grid planner. */
export const selectedWorksLayout = defineType({
  name: 'selectedWorksLayout',
  title: 'Selected works layout',
  type: 'object',
  fields: [
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{ type: 'selectedWorksProject' }],
    }),
    defineField({
      name: 'rowSettings',
      title: 'Row cell counts',
      type: 'array',
      description: 'Number of cells per row (10–12). Managed by the grid planner.',
      of: [
        defineArrayMember({
          type: 'number',
          validation: rule => rule.required().integer().min(10).max(12),
        }),
      ],
      hidden: () => true,
    }),
  ],
  components: {
    input: SelectedWorksGridManagerInput,
  },
})
