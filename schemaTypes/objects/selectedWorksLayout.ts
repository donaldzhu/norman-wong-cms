import { defineArrayMember, defineField, defineType } from 'sanity'

import { SelectedWorksGridManagerInput } from '../../components/selectedWorksGridManagerInput'

/** Per-breakpoint grid planner. Reads the shared `projects` array from the parent document. */
export const selectedWorksLayout = defineType({
  name: 'selectedWorksLayout',
  title: 'Selected works layout',
  type: 'object',
  fields: [
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
      // Not `hidden`: the parent layout's custom input only renders when at
      // least one member is visible. Suppress this field's UI via a no-op
      // input instead so the grid planner stays visible.
      components: {
        input: () => null,
        field: () => null,
      },
    }),
  ],
  components: {
    input: SelectedWorksGridManagerInput,
  },
})
