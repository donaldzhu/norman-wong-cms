import { ExpandIcon } from '@sanity/icons'
import { Button, Stack } from '@sanity/ui'
import { useState, type ReactElement } from 'react'
import type { ObjectInputProps } from 'sanity'

import { ProjectSlideGridPlannerDialog } from './projectSlideGridPlanner/projectSlideGridPlanner'
import type { ProjectSlideFormValue } from '../types/media'

export const ProjectSlideObjectInput = (
  props: ObjectInputProps<ProjectSlideFormValue>,
): ReactElement => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Stack space={3}>
      <Button
        text="Open slide grid planner"
        tone="primary"
        icon={ExpandIcon}
        style={{ cursor: 'pointer' }}
        onClick={() => setIsOpen(true)}
      />
      <ProjectSlideGridPlannerDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        inputProps={props}
      />
      {props.renderDefault(props)}
    </Stack>
  )
}
