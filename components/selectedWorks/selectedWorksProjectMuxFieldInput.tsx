import { Stack, Button, Text } from '@sanity/ui'
import { useState, type ReactElement } from 'react'
import type { ObjectInputProps } from 'sanity'
import { set } from 'sanity'

import { SlideMediaPickerDialog } from '../slideMediaPickerDialog'
import { useSelectedWorksProjectRef } from './selectedWorksProjectContext'

/**
 * Mux field with an explicit “pick from this project’s slides” action.
 * Still renders the default Mux input for uploads / advanced edits.
 */
export function SelectedWorksProjectMuxFieldInput(props: ObjectInputProps): ReactElement {
  const { renderDefault, onChange, readOnly } = props
  const projectRef = useSelectedWorksProjectRef()
  const projectId = projectRef?._ref
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <Stack space={3}>
      {!projectId ? (
        <Text muted size={1}>
          Select a <strong>Project</strong> on this block to pick a slide video.
        </Text>
      ) : (
        <Button
          text="Choose video from this project’s slides"
          mode="ghost"
          disabled={readOnly}
          onClick={() => setPickerOpen(true)}
        />
      )}

      {renderDefault(props)}

      {pickerOpen && projectId ? (
        <SlideMediaPickerDialog
          projectId={projectId}
          mode="video"
          zOffset={1200}
          onClose={() => setPickerOpen(false)}
          onPickImage={() => setPickerOpen(false)}
          onPickVideo={id => {
            onChange(
              set({
                _type: 'mux.video',
                asset: { _type: 'reference', _ref: id },
              }),
            )
            setPickerOpen(false)
          }}
        />
      ) : null}
    </Stack>
  )
}
