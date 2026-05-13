import * as changeCase from 'change-case'

import { defineArrayMember, defineField, defineType } from 'sanity'

import { SelectedWorksGridButton } from '../components/selectedWorks/selectedWorksGridButton'

interface SelectedWorksObjectProps {
  prefix: string
  min: number
  max: number
}

export const createSelectedWorksObject = ({
  prefix,
  min,
  max,
}: SelectedWorksObjectProps) => {
  prefix = changeCase.capitalCase(prefix)
  return defineType({
    name: `selectedWorks${prefix}Layout`,
    title: `${prefix} layout`,
    type: 'object',
    fields: [
      defineField({
        name: 'rowSettings',
        title: 'Row cell counts',
        type: 'array',
        description: `Number of cells per row (${min}–${max}). Managed by the grid planner.`,
        of: [
          defineArrayMember({
            type: 'number',
            validation: rule => rule.required().integer().min(min).max(max),
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
      input: SelectedWorksGridButton,
    },
  })

}