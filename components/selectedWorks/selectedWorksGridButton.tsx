import { ExpandIcon } from '@sanity/icons'
import { Button, Stack } from '@sanity/ui'
import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { set, useFormValue, type ObjectInputProps } from 'sanity'

import {
  flattenProjectList,
  autoPopulateRowSettings,
  getCellRange,
  SelectedWorksGridPlannerDialog,
  type SelectedWorksLayoutFormValue,
  type SelectedWorksProject,
} from './selectedWorksGridPlanner'

export const SelectedWorksGridButton = (
  props: ObjectInputProps<SelectedWorksLayoutFormValue>,
): ReactElement => {
  const { value, onChange, schemaType } = props

  const range = useMemo(() => getCellRange(schemaType?.options), [schemaType?.options])

  const projectsFromForm = useFormValue(['projects']) as
    | SelectedWorksProject[]
    | undefined

  const projects = projectsFromForm
  const rowSettings = value?.rowSettings

  const stream = useMemo(() => flattenProjectList(projects), [projects])

  useEffect(() => {
    const next = autoPopulateRowSettings(rowSettings, stream.length, range)
    if (JSON.stringify(next) !== JSON.stringify(rowSettings ?? [])) {
      onChange([set(next, ['rowSettings'])])
    }
  }, [onChange, range, rowSettings, stream.length])

  const [isOpen, setIsOpen] = useState(false)

  return (
    <Stack>
      <Button
        text="Open Grid Planner"
        tone="primary"
        onClick={() => setIsOpen(true)}
        style={{ cursor: 'pointer' }}
        icon={ExpandIcon}
      />

      <SelectedWorksGridPlannerDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        inputProps={props}
      />
    </Stack>
  )
}
