import { Box, Button, Card, Dialog, Flex, Select, Stack, Text } from '@sanity/ui'
import { useEffect, useMemo, useState, type ChangeEvent, type ReactElement } from 'react'
import { set, useFormValue, type ObjectInputProps } from 'sanity'

import { Orientation } from '../../constants/enum'
import type { ProjectSlideFormValue } from '../types/media'
import { ProjectSlideGridInteraction } from './projectSlideGridInteraction'
import { ProjectSlideGridPreview } from './projectSlideGridPreview'
import { ProjectSlideGridThumbnail } from './projectSlideGridThumbnail'

import * as changeCase from 'change-case'
import { getMediaGridSpanIssue, getSlideGridKeyPath } from '../../utils/projectSlide'
import {
  buildAutoLayoutPatches,
  type SlideAutoLayoutPreset,
} from '../../utils/projectSlideAutoLayout'
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
    if (!keys.length) return setActiveMediaKey(null)
    if (!activeMediaKey || !keys.includes(activeMediaKey)) setActiveMediaKey(keys[0])
  }, [open, media, activeMediaKey])

  const activeItem = useMemo(
    () => media.find(m => m._key === activeMediaKey) ?? null,
    [media, activeMediaKey],
  )

  const isMobile = tab === DeviceType.MOBILE
  const slidePath = inputProps.path

  const mobileOrientation = useFormValue([
    ...slidePath,
    'mobileOrientation',
  ]) as Orientation | undefined

  const orientationFormValue = mobileOrientation ?? Orientation.PORTRAIT

  const onToggleOrientation = (event: ChangeEvent<HTMLSelectElement>) =>
    onChange([set(event.currentTarget.value, ['mobileOrientation'])])

  const onSetGrid = ({ start, end }: GridSpan, activeMediaKey: string) => {
    if (!activeMediaKey) return
    onChange([
      set(start, getSlideGridKeyPath(activeMediaKey, tab, 'start')),
      set(end, getSlideGridKeyPath(activeMediaKey, tab, 'end')),
    ])
  }

  const onApplyAutoLayout = (preset: SlideAutoLayoutPreset) => {
    const keys = media.map(m => m._key).filter(Boolean) as string[]
    if (keys.length === 0) return
    onChange(buildAutoLayoutPatches(keys, preset))
  }

  const hasMedia = media.length > 0

  if (!open) return null

  const LEFT_COLUMN_WIDTH = 250
  const MEDIA_LIST_MAX_HEIGHT = 'calc(90vh - 18rem)'

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
      <Flex gap={5} padding={4}>
        <Flex
          direction="column"
          gap={3}
          style={{
            width: LEFT_COLUMN_WIDTH,
            flexShrink: 0,
            alignSelf: 'stretch',
            maxHeight: '100%',
            minHeight: 0,
          }}
        >
          <Text size={1} style={{ flexShrink: 0 }}>
            Project Media
          </Text>
          <Card
            radius={2}
            tone="transparent"
            border
            padding={2}
            style={{
              flex: '0 1 auto',
              minHeight: 0,
              maxHeight: MEDIA_LIST_MAX_HEIGHT,
              overflowY: 'auto',
            }}
          >
            {media.length === 0 ? <Text muted>This project contains no media.</Text> :
              <Stack gap={2} >
                {media.map(item =>
                  item._key && (
                    <ProjectSlideGridThumbnail
                      key={item._key}
                      item={item}
                      selected={item._key === activeMediaKey}
                      error={getMediaGridSpanIssue(item, orientationFormValue)}
                      onSelect={() => setActiveMediaKey(item._key)}
                    />
                  ),
                )}
              </Stack>
            }
          </Card>
          <Stack gap={5} style={{ flexShrink: 0, marginTop: 'auto' }}>
            <Stack gap={3}>
              <Text size={1} weight="medium">
                Auto Layout
              </Text>
              <Flex gap={2} wrap="wrap">
                <Button
                  text="Center"
                  mode="ghost"
                  disabled={!hasMedia}
                  title={
                    hasMedia
                      ? `Apply centered layout for ${media.length} item${media.length === 1 ? '' : 's'}`
                      : 'Add media to use auto-layout'
                  }
                  onClick={() => onApplyAutoLayout('center')}
                  style={{ cursor: hasMedia ? 'pointer' : 'default', flex: 1 }}
                />
                <Button
                  text="Justified"
                  mode="ghost"
                  disabled={!hasMedia}
                  title={
                    hasMedia
                      ? `Apply justified layout for ${media.length} item${media.length === 1 ? '' : 's'}`
                      : 'Add media to use auto-layout'
                  }
                  onClick={() => onApplyAutoLayout('justified')}
                  style={{ cursor: hasMedia ? 'pointer' : 'default', flex: 1 }}
                />
              </Flex>
            </Stack>
            <Stack gap={3}>
              <Text size={1} weight="medium">
                Mobile Orientation
              </Text>
              <Select
                value={orientationFormValue}
                onChange={onToggleOrientation}
              >
                <option value={Orientation.PORTRAIT}>{changeCase.capitalCase(Orientation.PORTRAIT)}</option>
                <option value={Orientation.LANDSCAPE}>{changeCase.capitalCase(Orientation.LANDSCAPE)}</option>
              </Select>
            </Stack>
          </Stack>
        </Flex>
        <Stack gap={4} flex={1}>
          <Text size={1} style={{ opacity: 0 }}>
            EMPTY
          </Text>
          <Flex gap={2} wrap="wrap">
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
              style={{ cursor: 'pointer' }}
            />
          </Flex>
          {
            activeItem && activeMediaKey ? (
              <Stack gap={3}>
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
    </Dialog>
  )
}
