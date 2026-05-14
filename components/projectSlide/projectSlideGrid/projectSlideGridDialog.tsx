import { Box, Button, Card, Dialog, Flex, Select, Stack, Text } from '@sanity/ui'
import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { set, unset, useFormValue, type FormPatch, type ObjectInputProps } from 'sanity'

import { Orientation } from '../../../constants/enum'
import {
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from '../../../utils/columnRange'
import type { ProjectSlideFormValue, ProjectSlideGridValue } from '../../types/media'
import { DesktopInteractionOverlay } from './desktopInteractionOverlay'
import { DesktopPreviewLayer } from './desktopPreviewLayer'
import { MobileAutomaticReadOnlyPreview } from './mobileAutomaticReadOnlyPreview'
import { MobileCombinedActiveSpanEditor } from './mobileCombinedActiveSpanEditor'
import { ProjectSlideGridThumbnail } from './projectSlideGridThumbnail'

import { isValidDesktopSpan, isValidMobileSpan, mediaKeyPath } from './utils'
import * as changeCase from 'change-case'


enum PlannerTab {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}



interface ProjectSlideGridPlannerDialogProps {
  open: boolean
  onClose: () => void
  inputProps: ObjectInputProps<ProjectSlideFormValue>
}


export const ProjectSlideGridDialog = ({
  open,
  onClose,
  inputProps,
}: ProjectSlideGridPlannerDialogProps): ReactElement | null => {
  const { value, onChange } = inputProps
  const media = value?.media ?? []

  const [tab, setTab] = useState<PlannerTab>(PlannerTab.DESKTOP)
  const [activeMediaKey, setActiveMediaKey] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const keys = media.map(m => m._key).filter(Boolean) as string[]
    if (keys.length === 0) {
      setActiveMediaKey(null)
      return
    }
    if (!activeMediaKey || !keys.includes(activeMediaKey)) setActiveMediaKey(keys[0])
  }, [open, media, activeMediaKey])

  const activeItem = useMemo(
    () => media.find(m => m._key === activeMediaKey) ?? null,
    [media, activeMediaKey],
  )

  const slidePath = inputProps.path

  const slideAutomaticMobile = useFormValue([
    ...slidePath,
    'automaticMobileLayout',
  ]) as boolean | undefined
  const slideMobileOrientation = useFormValue([
    ...slidePath,
    'mobileOrientation',
  ]) as string | undefined

  const slideMobileOrientationVisual: 'portrait' | 'landscape' =
    slideMobileOrientation === Orientation.LANDSCAPE ? 'landscape' : 'portrait'

  const mobileCellCountForIssue = useMemo(
    () =>
      slideMobileOrientation === Orientation.LANDSCAPE
        ? MOBILE_LANDSCAPE_COLUMN_COUNT
        : MOBILE_PORTRAIT_ROW_COUNT,
    [slideMobileOrientation],
  )

  const itemHasSpanIssue = useCallback(
    (item: ProjectSlideGridValue) => {
      if (!isValidDesktopSpan(item.desktopStart, item.desktopEnd)) return true
      if (
        slideAutomaticMobile === false &&
        !isValidMobileSpan(item.mobileStart, item.mobileEnd, mobileCellCountForIssue)
      )
        return true
      return false
    },
    [slideAutomaticMobile, mobileCellCountForIssue],
  )

  const patchActive = useCallback(
    (patches: FormPatch[]) => {
      if (!activeMediaKey) return
      onChange(patches)
    },
    [activeMediaKey, onChange],
  )

  const patchSlide = useCallback(
    (patches: FormPatch[]) => onChange(patches),
    [onChange],
  )

  if (!open) return null

  const automaticMobileOn = slideAutomaticMobile !== false
  const orientationFormValue = slideMobileOrientation ?? Orientation.PORTRAIT

  const LEFT_COLUMN_WIDTH = 250
  return (
    <Dialog
      header="Slide Grid Planner"
      id="project-slide-grid-planner"
      open
      onClose={onClose}
      width={4}
      height={4}
      zOffset={999}
      style={{ maxHeight: '90vh' }}
    >
      <Stack space={3} >
        <Flex gap={5} padding={4} align="flex-start" wrap="wrap">
          <Stack space={3} style={{ width: LEFT_COLUMN_WIDTH, flexShrink: 0 }}>
            <Text size={1} weight="semibold">
              Project Media
            </Text>
            <Card radius={2} tone="transparent" border>
              {media.length === 0 ? <Text muted>This project contains no media.</Text> :
                <Stack space={2} >
                  {media.map(item =>
                    item._key ? (
                      <ProjectSlideGridThumbnail
                        key={item._key}
                        item={item}
                        selected={item._key === activeMediaKey}
                        hasError={itemHasSpanIssue(item)}
                        onSelect={() => setActiveMediaKey(item._key)}
                      />
                    ) : null,
                  )}
                </Stack>
              }
            </Card>
          </Stack>
          <Stack space={4} flex={1} style={{ minWidth: 280 }} marginTop={4}>
            <Flex gap={2} justify="space-between">
              <Flex gap={2}>
                <Button
                  text={changeCase.capitalCase(PlannerTab.DESKTOP)}
                  mode={tab === PlannerTab.DESKTOP ? 'default' : 'ghost'}
                  onClick={() => setTab(PlannerTab.DESKTOP)}
                />
                <Button
                  text={changeCase.capitalCase(PlannerTab.MOBILE)}
                  mode={tab === PlannerTab.MOBILE ? 'default' : 'ghost'}
                  onClick={() => setTab(PlannerTab.MOBILE)}
                />
              </Flex>
              <Flex gap={2}>
                <Flex gap={5} align="center" wrap="wrap">
                  <Flex gap={3} align="center">
                    <Text style={{ flexShrink: 0 }}>Mobile Orientation:</Text>
                    <Select
                      value={orientationFormValue}
                      disabled={automaticMobileOn}
                      onChange={event => {
                        patchSlide([set(event.currentTarget.value, ['mobileOrientation'])])
                      }}
                    >
                      <option value={Orientation.PORTRAIT}>{changeCase.capitalCase(Orientation.PORTRAIT)}</option>
                      <option value={Orientation.LANDSCAPE}>{changeCase.capitalCase(Orientation.LANDSCAPE)}</option>
                    </Select>
                  </Flex>
                  <Button
                    text={`Automatic Mobile Layout: ${automaticMobileOn ? 'On' : 'Off'}`}
                    tone={automaticMobileOn ? 'primary' : 'neutral'}
                    style={{
                      cursor: 'pointer',
                      width: LEFT_COLUMN_WIDTH,
                    }}
                    onClick={() => patchSlide([set(!automaticMobileOn, ['automaticMobileLayout'])])}
                  />
                </Flex>

              </Flex>
            </Flex>

            {tab === PlannerTab.DESKTOP ? (
              activeItem && activeMediaKey ? (
                <Stack space={3}>
                  <Box
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '2 / 1',
                      maxWidth: '100%',
                      background: 'var(--card-border-color, rgba(127,127,127,0.22))',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <DesktopPreviewLayer media={media} activeKey={activeMediaKey} />
                    <DesktopInteractionOverlay
                      key={activeMediaKey}
                      start={activeItem.desktopStart}
                      end={activeItem.desktopEnd}
                      onCommit={(start, end) =>
                        patchActive([
                          set(start, mediaKeyPath(activeMediaKey, 'desktopStart')),
                          set(end, mediaKeyPath(activeMediaKey, 'desktopEnd')),
                        ])
                      }
                    />
                  </Box>
                </Stack>
              ) : (
                <Card padding={4} radius={2} tone="transparent" border>
                  <Text size={1}>Select a media item on the left.</Text>
                </Card>
              )
            ) : automaticMobileOn ? (
              <MobileAutomaticReadOnlyPreview
                media={media}
                activeKey={activeMediaKey}
                orientation={slideMobileOrientationVisual}
              />
            ) : activeItem && activeMediaKey ? (
              <MobileCombinedActiveSpanEditor
                media={media}
                activeItem={activeItem}
                activeMediaKey={activeMediaKey}
                orientation={slideMobileOrientationVisual}
                onCommit={(start, end) =>
                  patchActive([
                    set(start, mediaKeyPath(activeMediaKey, 'mobileStart')),
                    set(end, mediaKeyPath(activeMediaKey, 'mobileEnd')),
                  ])
                }
                onClear={() =>
                  patchActive([
                    unset(mediaKeyPath(activeMediaKey, 'mobileStart')),
                    unset(mediaKeyPath(activeMediaKey, 'mobileEnd')),
                  ])
                }
              />
            ) : (
              <Card padding={4} radius={2} tone="transparent" border>
                <Text size={1}>Select a media item on the left.</Text>
              </Card>
            )}
          </Stack>
        </Flex>
      </Stack>
    </Dialog>
  )
}
