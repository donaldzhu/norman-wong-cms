import { ExpandIcon } from '@sanity/icons'
import { Button, Flex, Stack, Text } from '@sanity/ui'
import { useMemo, useState, type ReactElement } from 'react'
import type { ObjectInputProps } from 'sanity'

import { Orientation } from '../../constants/enum'
import { GRID_SETTINGS_INCOMPLETE_MESSAGE, validateSlideGrid } from '../../utils/projectSlide'
import { ErrorIcon } from '../common/errorIcon'
import type { ProjectSlideFormValue } from '../types/media'
import { ProjectSlideGridDialog } from './projectSlideGridDialog'


export const ProjectSlideGridButton = (
  props: ObjectInputProps<ProjectSlideFormValue>,
): ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const orientation = (props.value?.mobileOrientation ?? Orientation.PORTRAIT) as Orientation

  const hasIncompleteGrid = useMemo(
    () => validateSlideGrid(props.value?.media, orientation),
    [props.value?.media, orientation],
  )

  return (
    <Stack gap={5}>
      <Stack gap={2}>
        {hasIncompleteGrid && (
          <Flex align="center" gap={1}>
            <ErrorIcon />
            <Text size={1} style={{ color: 'var(--card-badge-critical-icon-color)' }}>
              {GRID_SETTINGS_INCOMPLETE_MESSAGE}
            </Text>
          </Flex>
        )}
        <Button
          text="Open slide grid planner"
          tone="primary"
          icon={ExpandIcon}
          style={{ cursor: 'pointer' }}
          onClick={() => setIsOpen(true)}
        />
      </Stack>
      <ProjectSlideGridDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        inputProps={props}
      />
      {props.renderDefault(props)}
    </Stack>
  )
}
