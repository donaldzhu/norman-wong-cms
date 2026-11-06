import { slideV2Error } from '../../utils/projectSlideV2'
import { projectSlideMediaChange } from '../../utils/projectSlideMediaChange'
import { ExpandIcon } from '@sanity/icons'
import { Button, Flex, Stack, Text } from '@sanity/ui'
import { useCallback, useMemo, useState, type ReactElement } from 'react'
import { FormCallbacksProvider, PatchEvent, set, useFormCallbacks, type ObjectInputProps } from 'sanity'

import { Orientation } from '../../constants/enum'
import { GRID_SETTINGS_INCOMPLETE_MESSAGE, validateSlideGrid } from '../../utils/projectSlide'
import { ErrorIcon } from '../common/errorIcon'
import type { ProjectSlideFormValue } from '../types/media'
import { ProjectSlideMockDialog } from './projectSlideMockDialog'
import { ProjectSlideJustifyContext } from './projectSlidePreviewContext'


export const ProjectSlideGridButton = (
  props: ObjectInputProps<ProjectSlideFormValue>,
): ReactElement => {
  const [isMockOpen, setIsMockOpen] = useState(false)
  const formCallbacks = useFormCallbacks()
  const handleMediaChange = useCallback<ObjectInputProps<ProjectSlideFormValue>['onChange']>(change => {
    if (!props.readOnly) props.onChange(projectSlideMediaChange(props.value, PatchEvent.from(change)))
  }, [props.onChange, props.readOnly, props.value])
  const orientation = (props.value?.mobileOrientation ?? Orientation.PORTRAIT) as Orientation
  const media = props.value?.media ?? []
  const justified = media.length === 1 && (props.value?.layoutV2
    ? props.value.layoutV2.desktop?.mode === 'justify'
    : media[0].desktopEnd! - media[0].desktopStart! === 24)

  const layoutError = useMemo(
    () => props.value?.layoutV2 ? slideV2Error(props.value) : validateSlideGrid(props.value?.media, orientation) ? GRID_SETTINGS_INCOMPLETE_MESSAGE : undefined,
    [props.value, orientation],
  )

  return (
    <Stack gap={5}>
      <Stack gap={2}>
        {layoutError && (
          <Flex align="center" gap={1}>
            <ErrorIcon />
            <Text size={1} style={{ color: 'var(--card-badge-critical-icon-color)' }}>
              {layoutError}
            </Text>
          </Flex>
        )}
        <Button
          text="Open slide planner"
          disabled={props.readOnly}
          tone="primary"
          icon={ExpandIcon}
          style={{ cursor: 'pointer' }}
          onClick={() => setIsMockOpen(true)}
        />
      </Stack>
      {isMockOpen && <ProjectSlideMockDialog
        key={JSON.stringify(props.path)}
        value={props.value}
        onLayoutChange={props.readOnly ? undefined : (layoutV2, spans) => props.onChange([set(layoutV2, ['layoutV2']), ...spans.flatMap(m => [set(m.desktopSpan, ['media', { _key: m._key }, 'desktopSpan']), set(m.mobileSpan, ['media', { _key: m._key }, 'mobileSpan'])])])}
        onClose={() => setIsMockOpen(false)}
      />}
      {/* Nested fields use form callbacks rather than the ObjectInput onChange prop. */}
      <FormCallbacksProvider {...formCallbacks} onChange={handleMediaChange}>
        <ProjectSlideJustifyContext.Provider value={justified}>
          {props.renderDefault({ ...props, onChange: handleMediaChange })}
        </ProjectSlideJustifyContext.Provider>
      </FormCallbacksProvider>
    </Stack>
  )
}
