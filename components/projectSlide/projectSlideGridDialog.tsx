import { Box, Button, Card, Dialog, Flex, Select, Stack, Text } from '@sanity/ui'
import { useEffect, useMemo, useState, type ChangeEvent, type ReactElement } from 'react'
import { set, useFormValue, type ObjectInputProps } from 'sanity'

import { Orientation } from '../../constants/enum'
import type { ProjectSlideFormValue, ProjectSlideGridValue } from '../types/media'
import { ProjectSlideGridInteraction } from './projectSlideGridInteraction'
import { ProjectSlideGridPreview } from './projectSlideGridPreview'
import { ProjectSlideGridThumbnail } from './projectSlideGridThumbnail'

import * as changeCase from 'change-case'
import { getSlideGridKeyPath, validateSpan } from '../../utils/projectSlide'
import { DeviceType, GridSpan } from '../types/selectedWorks'

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

  const [tab, setTab] = useState<DeviceType>(DeviceType.DESKTOP)
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

  const isMobile = tab === DeviceType.MOBILE
  const slidePath = inputProps.path

  const slideAutomaticMobile = useFormValue([
    ...slidePath,
    'automaticMobileLayout',
  ]) as boolean | undefined
  const mobileOrientation = useFormValue([
    ...slidePath,
    'mobileOrientation',
  ]) as Orientation | undefined

  const getSpanIssue = (item: ProjectSlideGridValue) => {
    const desktopIssue = validateSpan(item.desktopStart, item.desktopEnd, DeviceType.DESKTOP)
    if (desktopIssue) return desktopIssue

    if (!automaticMobileOn) {
      const mobileIssue = validateSpan(item.mobileStart, item.mobileEnd, DeviceType.MOBILE, mobileOrientation)
      if (mobileIssue) return mobileIssue
    }
  }


  const onToggleOrientation = (event: ChangeEvent<HTMLSelectElement>) =>
    onChange([set(event.currentTarget.value, ['mobileOrientation'])])

  const onSetGrid = ({ start, end }: GridSpan, activeMediaKey: string) => {
    if (!activeMediaKey) return
    onChange([
      set(start, getSlideGridKeyPath(activeMediaKey, tab, 'start')),
      set(end, getSlideGridKeyPath(activeMediaKey, tab, 'end')),
    ])
  }


  const onToggleAutomaticMobile = () => {
    onChange([set(!automaticMobileOn, ['automaticMobileLayout'])])
    setTab(DeviceType.DESKTOP)
  }

  if (!open) return null

  const automaticMobileOn = slideAutomaticMobile !== false
  const orientationFormValue = mobileOrientation ?? Orientation.PORTRAIT

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
                        error={getSpanIssue(item)}
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
                  text={changeCase.capitalCase(DeviceType.DESKTOP)}
                  mode={!isMobile ? 'default' : 'ghost'}
                  onClick={() => setTab(DeviceType.DESKTOP)}
                  style={{
                    cursor: 'pointer',
                  }}
                />
                <Button
                  text={changeCase.capitalCase(DeviceType.MOBILE)}
                  mode={isMobile ? 'default' : 'ghost'}
                  onClick={() => setTab(DeviceType.MOBILE)}
                  disabled={automaticMobileOn}
                  style={{
                    cursor: automaticMobileOn ? 'not-allowed' : 'pointer',
                  }}
                />
              </Flex>
              <Flex gap={2}>
                <Flex gap={5} align="center" wrap="wrap">
                  <Flex gap={3} align="center">
                    <Text style={{ flexShrink: 0 }}>Mobile Orientation:</Text>
                    <Select
                      value={automaticMobileOn ? Orientation.LANDSCAPE : orientationFormValue}
                      disabled={automaticMobileOn}
                      onChange={onToggleOrientation}
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
                    onClick={onToggleAutomaticMobile}
                  />
                </Flex>
              </Flex>
            </Flex>
            {
              activeItem && activeMediaKey ? (
                <Stack space={3}>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      aspectRatio: '2 / 1',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        width: !isMobile ? '100%' : '50%',
                        height: '100%',
                        position: 'relative',
                        aspectRatio: isMobile ? '1 / 2' : undefined,
                        border: '2px solid var(--card-border-color)',
                        borderRadius: 4,
                        boxSizing: 'border-box',
                      }}
                    >
                      <ProjectSlideGridPreview media={media} activeKey={activeMediaKey} tab={tab} orientation={mobileOrientation} />
                      <ProjectSlideGridInteraction
                        key={activeMediaKey}
                        orientation={mobileOrientation}
                        tab={tab}
                        onCommit={span => onSetGrid(span, activeMediaKey)}
                      />
                    </Box>
                  </Box>
                </Stack>
              ) : (
                <Card padding={4} radius={2} tone="transparent" border>
                  <Text size={1}>Select a media item on the left.</Text>
                </Card>
              )
            }
          </Stack>
        </Flex>
      </Stack>
    </Dialog>
  )
}
