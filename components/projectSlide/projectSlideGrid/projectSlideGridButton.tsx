import { ExpandIcon } from '@sanity/icons'
import { Button, Stack } from '@sanity/ui'
import { useState, type ReactElement } from 'react'
import type { ObjectInputProps } from 'sanity'

import type { ProjectSlideFormValue } from '../../types/media'
import { ProjectSlideGridDialog } from './projectSlideGridDialog'

export const ProjectSlideGridButton = (
  props: ObjectInputProps<ProjectSlideFormValue>,
): ReactElement => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Stack space={5}>
      <Button
        text="Open slide grid planner"
        tone="primary"
        icon={ExpandIcon}
        style={{ cursor: 'pointer' }}
        onClick={() => setIsOpen(true)}

      />
      <ProjectSlideGridDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        inputProps={props}
      />
      {props.renderDefault(props)}
    </Stack>
  )
}
