import { ErrorOutlineIcon } from '@sanity/icons'
import { Box, Button, Card, Dialog, Flex, Select, Stack, Switch, Text } from '@sanity/ui'
import {
  set,
  unset,
  useFormValue,
  type FormPatch,
  type ObjectInputProps,
} from 'sanity'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
} from 'react'

import { useClickAway } from '@uidotdev/usehooks'

import {
  DESKTOP_COLUMN_COUNT,
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
  cellIsInSpan,
  spanFromClickedCells,
  spanFromSingleCell,
} from '../../../utils/columnRange'
import { MediaRefPreview } from '../../previews/mediaRefPreview'
import { MediaType, Orientation } from '../../../constants/enum'
import type { ProjectSlideFormValue, ProjectSlideMediaGridValue } from '../../types/media'

type PlannerTab = 'desktop' | 'mobile'

const mediaKeyPath = (key: string, field: string): [string, { _key: string }, string] => [
  'media',
  { _key: key },
  field,
]

const isValidDesktopSpan = (start: number | undefined, end: number | undefined) =>
  typeof start === 'number' &&
  typeof end === 'number' &&
  start >= 1 &&
  start <= DESKTOP_COLUMN_COUNT &&
  end >= 2 &&
  end <= DESKTOP_COLUMN_COUNT + 1 &&
  end > start

const isValidMobileSpan = (
  start: number | undefined,
  end: number | undefined,
  cellCount: number,
) => {
  const maxEdge = cellCount + 1
  return (
    typeof start === 'number' &&
    typeof end === 'number' &&
    start >= 1 &&
    start <= cellCount &&
    end >= 2 &&
    end <= maxEdge &&
    end > start
  )
}

/** Equal row/column slices for read-only “automatic” preview (not persisted). */
const equalSplitMobileSpans = (
  itemCount: number,
  cellCount: number,
): { start: number; end: number }[] => {
  if (itemCount <= 0 || cellCount <= 0) return []
  const base = Math.floor(cellCount / itemCount)
  let remainder = cellCount % itemCount
  const spans: { start: number; end: number }[] = []
  let start = 1
  for (let i = 0; i < itemCount; i++) {
    const len = base + (remainder > 0 ? 1 : 0)
    if (remainder > 0) remainder -= 1
    const end = start + len
    spans.push({ start, end })
    start = end
  }
  return spans
}

type MobilePlacement = {
  item: ProjectSlideMediaGridValue
  start: number
  end: number
}

const MobileZebraBackdrop = ({
  direction,
  cellCount,
}: {
  direction: 'horizontal' | 'vertical'
  cellCount: number
}) => {
  const cells = Array.from({ length: cellCount }, (_, i) => i + 1)
  const gridStyle: CSSProperties =
    direction === 'horizontal'
      ? {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${cellCount}, minmax(0, 1fr))`,
        gridTemplateRows: '1fr',
        gap: 1,
        zIndex: 1,
        pointerEvents: 'none',
      }
      : {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: `repeat(${cellCount}, minmax(0, 1fr))`,
        gap: 1,
        zIndex: 1,
        pointerEvents: 'none',
      }

  return (
    <Box style={gridStyle}>
      {cells.map(cell => (
        <Box
          key={cell}
          style={{
            borderRadius: 2,
            background: cell % 2 === 0 ? 'rgba(127,127,127,0.12)' : 'rgba(127,127,127,0.06)',
          }}
        />
      ))}
    </Box>
  )
}

const ThumbnailRow = ({
  item,
  selected,
  hasSpanError,
  onSelect,
}: {
  item: ProjectSlideMediaGridValue
  selected: boolean
  hasSpanError: boolean
  onSelect: () => void
}) => {
  const isVideo = item.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? item.video : item.image
  const hasRef = Boolean(mediaWithRef?.asset?._ref)

  return (
    <Card
      as="button"
      type="button"
      padding={2}
      radius={2}
      tone={hasSpanError ? 'critical' : selected ? 'primary' : 'transparent'}
      border
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        outline: selected ? '2px solid var(--card-focus-ring-color)' : undefined,
      }}
    >
      <Flex align="center" gap={3}>
        <Box flex="none" style={{ position: 'relative', width: 56, height: 56 }}>
          <Box
            style={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: 4,
              overflow: 'hidden',
              background: 'var(--card-muted-bg-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hasRef ? (
              <MediaRefPreview
                mediaType={isVideo ? MediaType.VIDEO : MediaType.IMAGE}
                mediaWithRef={mediaWithRef}
                sanityImageWidth={200}
                showSpinner={isVideo}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <Flex align="center" justify="center" height="fill" padding={2}>
                <Text muted size={0}>
                  {isVideo ? 'Video' : '—'}
                </Text>
              </Flex>
            )}
          </Box>
          {hasSpanError ? (
            <Box
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                color: 'var(--card-badge-critical-icon-color)',
                lineHeight: 0,
                pointerEvents: 'none',
              }}
            >
              <ErrorOutlineIcon />
            </Box>
          ) : null}
        </Box>
        <Text size={1} weight={selected ? 'semibold' : 'regular'}>
          {isVideo ? 'Video' : 'Image'}
        </Text>
      </Flex>
    </Card>
  )
}

const DesktopPreviewLayer = ({
  media,
  activeKey,
}: {
  media: ProjectSlideMediaGridValue[]
  activeKey: string | null
}) => (
  <Box
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: `repeat(${DESKTOP_COLUMN_COUNT}, minmax(0, 1fr))`,
      gridTemplateRows: '1fr',
      pointerEvents: 'none',
      zIndex: 1,
    }}
  >
    {media.map((item, index) => {
      if (!item._key || !isValidDesktopSpan(item.desktopStart, item.desktopEnd)) return null
      const isActive = item._key === activeKey
      return (
        <Box
          key={item._key}
          style={{
            gridColumn: `${item.desktopStart} / ${item.desktopEnd}`,
            gridRow: '1',
            position: 'relative',
            zIndex: isActive ? 50 : 10 + index,
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: isActive ? '0 0 0 2px var(--card-focus-ring-color)' : undefined,
            boxSizing: 'border-box',
            background: 'var(--card-muted-bg-color)',
          }}
        >
          <MediaInCell item={item} />
        </Box>
      )
    })}
  </Box>
)

const MediaInCell = ({ item }: { item: ProjectSlideMediaGridValue }) => {
  const isVideo = item.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? item.video : item.image
  const hasRef = Boolean(mediaWithRef?.asset?._ref)
  if (!hasRef) {
    return (
      <Flex align="center" justify="center" height="fill">
        <Text muted size={0}>
          —
        </Text>
      </Flex>
    )
  }
  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MediaRefPreview
        mediaType={isVideo ? MediaType.VIDEO : MediaType.IMAGE}
        mediaWithRef={mediaWithRef}
        sanityImageWidth={400}
        showSpinner={isVideo}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  )
}

const DesktopInteractionOverlay = ({
  start,
  end,
  readOnly,
  onCommit,
}: {
  start: number | undefined
  end: number | undefined
  readOnly: boolean
  onCommit: (start: number, end: number) => void
}) => {
  const [pendingAnchor, setPendingAnchor] = useState<number | null>(null)

  const handleCellClick = useCallback(
    (cell: number, event: MouseEvent<HTMLButtonElement>) => {
      if (readOnly) return

      if (event.shiftKey || pendingAnchor == null) {
        const { start: s, end: e } = spanFromSingleCell(cell)
        onCommit(s, e)
        setPendingAnchor(cell)
        return
      }

      if (cell <= pendingAnchor) {
        const { start: s, end: e } = spanFromSingleCell(cell)
        onCommit(s, e)
        setPendingAnchor(cell)
        return
      }

      const { start: s, end: e } = spanFromClickedCells(pendingAnchor, cell)
      onCommit(s, e)
      setPendingAnchor(null)
    },
    [pendingAnchor, onCommit, readOnly],
  )

  const cells = Array.from({ length: DESKTOP_COLUMN_COUNT }, (_, i) => i + 1)

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: `repeat(${DESKTOP_COLUMN_COUNT}, minmax(0, 1fr))`,
    gridTemplateRows: '1fr',
    gap: 1,
    zIndex: 60,
    pointerEvents: readOnly ? 'none' : 'auto',
  }

  return (
    <Box role="group" aria-label="Desktop span. Two-click span. Shift+click: one cell." style={overlayStyle}>
      {cells.map(col => {
        const selected = start != null && end != null && cellIsInSpan(col, start, end)
        const zebra = col % 2 === 0 ? 'rgba(127,127,127,0.12)' : 'rgba(127,127,127,0.06)'

        return (
          <button
            key={col}
            type="button"
            disabled={readOnly}
            onClick={event => handleCellClick(col, event)}
            title={`Column ${col}`}
            style={{
              position: 'relative',
              margin: 0,
              padding: 0,
              minWidth: 0,
              minHeight: 0,
              border: 0,
              borderRadius: 2,
              cursor: readOnly ? 'default' : 'pointer',
              background: 'transparent',
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: zebra,
                pointerEvents: 'none',
                borderRadius: 2,
              }}
            />
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: selected ? 'var(--sanity-color-accent-fg, #2276fc)' : 'transparent',
                opacity: selected ? 0.35 : 0,
                pointerEvents: 'none',
              }}
            />
          </button>
        )
      })}
    </Box>
  )
}

/** Same click rules as `ColumnRangeStrip` / desktop overlay; horizontal = columns, vertical = rows. */
const LinearSpanInteractionOverlay = ({
  direction,
  cellCount,
  start,
  end,
  readOnly,
  onCommit,
  ariaLabel,
}: {
  direction: 'horizontal' | 'vertical'
  cellCount: number
  start: number | undefined
  end: number | undefined
  readOnly: boolean
  onCommit: (start: number, end: number) => void
  ariaLabel: string
}) => {
  const [pendingAnchor, setPendingAnchor] = useState<number | null>(null)
  const containerRef = useClickAway<HTMLDivElement>(() => setPendingAnchor(null))

  const handleCellClick = useCallback(
    (cell: number, event: MouseEvent<HTMLButtonElement>) => {
      if (readOnly) return

      if (event.shiftKey || pendingAnchor == null) {
        const { start: s, end: e } = spanFromSingleCell(cell)
        onCommit(s, e)
        setPendingAnchor(cell)
        return
      }

      if (cell <= pendingAnchor) {
        const { start: s, end: e } = spanFromSingleCell(cell)
        onCommit(s, e)
        setPendingAnchor(cell)
        return
      }

      const { start: s, end: e } = spanFromClickedCells(pendingAnchor, cell)
      onCommit(s, e)
      setPendingAnchor(null)
    },
    [pendingAnchor, onCommit, readOnly],
  )

  const cells = Array.from({ length: cellCount }, (_, i) => i + 1)

  const overlayStyle: CSSProperties =
    direction === 'horizontal'
      ? {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${cellCount}, minmax(0, 1fr))`,
        gridTemplateRows: '1fr',
        gap: 1,
        zIndex: 60,
        pointerEvents: readOnly ? 'none' : 'auto',
      }
      : {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: `repeat(${cellCount}, minmax(0, 1fr))`,
        gap: 1,
        zIndex: 60,
        pointerEvents: readOnly ? 'none' : 'auto',
      }

  return (
    <Box ref={containerRef} role="group" aria-label={ariaLabel} style={overlayStyle}>
      {cells.map(cell => {
        const selected = start != null && end != null && cellIsInSpan(cell, start, end)
        const zebra = cell % 2 === 0 ? 'rgba(127,127,127,0.12)' : 'rgba(127,127,127,0.06)'

        return (
          <button
            key={cell}
            type="button"
            disabled={readOnly}
            onClick={event => handleCellClick(cell, event)}
            title={direction === 'horizontal' ? `Column ${cell}` : `Row ${cell}`}
            style={{
              position: 'relative',
              margin: 0,
              padding: 0,
              minWidth: 0,
              minHeight: 0,
              border: 0,
              borderRadius: 2,
              cursor: readOnly ? 'default' : 'pointer',
              background: 'transparent',
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: zebra,
                pointerEvents: 'none',
                borderRadius: 2,
              }}
            />
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: selected ? 'var(--sanity-color-accent-fg, #2276fc)' : 'transparent',
                opacity: selected ? 0.35 : 0,
                pointerEvents: 'none',
              }}
            />
          </button>
        )
      })}
    </Box>
  )
}

const MobileAllMediaPreviewLayer = ({
  activeKey,
  orientation,
  placements,
  media,
}: {
  activeKey: string | null
  orientation: 'portrait' | 'landscape'
  placements?: MobilePlacement[]
  media?: ProjectSlideMediaGridValue[]
}) => {
  const isPortrait = orientation === 'portrait'
  const cellCount = isPortrait ? MOBILE_PORTRAIT_ROW_COUNT : MOBILE_LANDSCAPE_COLUMN_COUNT
  const direction = isPortrait ? 'vertical' : 'horizontal'

  const rows = useMemo(() => {
    if (placements && placements.length > 0) return placements
    const list = media ?? []
    return list.flatMap(item => {
      if (!item._key || !isValidMobileSpan(item.mobileStart, item.mobileEnd, cellCount)) return []
      return [
        {
          item,
          start: item.mobileStart as number,
          end: item.mobileEnd as number,
        },
      ]
    })
  }, [placements, media, cellCount])

  const gridStyle: CSSProperties =
    direction === 'horizontal'
      ? {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${cellCount}, minmax(0, 1fr))`,
        gridTemplateRows: '1fr',
        gap: 1,
        pointerEvents: 'none',
        zIndex: 20,
      }
      : {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: `repeat(${cellCount}, minmax(0, 1fr))`,
        gap: 1,
        pointerEvents: 'none',
        zIndex: 20,
      }

  const placementFor = (start: number | undefined, end: number | undefined) =>
    direction === 'horizontal'
      ? { gridColumn: `${start} / ${end}` as const, gridRow: '1' as const }
      : { gridColumn: '1' as const, gridRow: `${start} / ${end}` as const }

  return (
    <Box style={gridStyle}>
      {rows.map((row, index) => {
        const { item, start, end } = row
        if (!item._key) return null
        const isActive = item._key === activeKey
        return (
          <Box
            key={item._key}
            style={{
              ...placementFor(start, end),
              position: 'relative',
              zIndex: isActive ? 50 : 10 + index,
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: isActive ? '0 0 0 2px var(--card-focus-ring-color)' : undefined,
              boxSizing: 'border-box',
              background: 'var(--card-muted-bg-color)',
            }}
          >
            <MediaInCell item={item} />
          </Box>
        )
      })}
    </Box>
  )
}

const mobilePreviewFrameStyle = (isPortrait: boolean): CSSProperties => ({
  position: 'relative',
  width: isPortrait ? 'min(45%, 280px)' : '100%',
  maxWidth: 480,
  aspectRatio: '1 / 2',
  background: 'var(--card-border-color, rgba(127,127,127,0.22))',
  borderRadius: 4,
  overflow: 'hidden',
})

/** Read-only mobile frame when automatic layout is on (equal split, not saved). */
const MobileAutomaticReadOnlyPreview = ({
  media,
  activeKey,
  orientation,
}: {
  media: ProjectSlideMediaGridValue[]
  activeKey: string | null
  orientation: 'portrait' | 'landscape'
}) => {
  const isPortrait = orientation === 'portrait'
  const cellCount = isPortrait ? MOBILE_PORTRAIT_ROW_COUNT : MOBILE_LANDSCAPE_COLUMN_COUNT
  const direction = isPortrait ? 'vertical' : 'horizontal'

  const placements = useMemo(() => {
    const items = media.filter(m => m._key)
    const spans = equalSplitMobileSpans(items.length, cellCount)
    return items.map((item, i) => ({
      item,
      start: spans[i]?.start ?? 1,
      end: spans[i]?.end ?? cellCount + 1,
    }))
  }, [media, cellCount])

  if (placements.length === 0) {
    return (
      <Box padding={4}>
        <Text size={1}>Add media to preview mobile layout.</Text>
      </Box>
    )
  }

  return (
    <Box style={mobilePreviewFrameStyle(isPortrait)}>
      <MobileZebraBackdrop direction={direction} cellCount={cellCount} />
      <MobileAllMediaPreviewLayer
        placements={placements}
        activeKey={activeKey}
        orientation={orientation}
      />
    </Box>
  )
}

const MobileCombinedActiveSpanEditor = ({
  media,
  activeItem,
  activeMediaKey,
  orientation,
  readOnly,
  onCommit,
  onClear,
}: {
  media: ProjectSlideMediaGridValue[]
  activeItem: ProjectSlideMediaGridValue
  activeMediaKey: string
  orientation: 'portrait' | 'landscape'
  readOnly: boolean
  onCommit: (start: number, end: number) => void
  onClear: () => void
}) => {
  const isPortrait = orientation === 'portrait'
  const cellCount = isPortrait ? MOBILE_PORTRAIT_ROW_COUNT : MOBILE_LANDSCAPE_COLUMN_COUNT
  const direction = isPortrait ? 'vertical' : 'horizontal'
  const unitLabel = isPortrait ? 'Row' : 'Column'
  const start = activeItem.mobileStart
  const end = activeItem.mobileEnd
  const rangeLabel =
    start != null && end != null ? `${unitLabel}: ${start}–${end}` : `${unitLabel}: —`

  const stripOuter: CSSProperties = mobilePreviewFrameStyle(isPortrait)

  return (
    <Box>
      <Flex align="center" justify="flex-end" gap={3} style={{ marginBottom: 8 }}>
        <Button
          text="Clear"
          mode="ghost"
          disabled={readOnly}
          onClick={() => onClear()}
        />
        <Text size={1} style={{ lineHeight: 1.2 }}>
          {rangeLabel}
        </Text>
      </Flex>

      <Box style={stripOuter}>
        <MobileZebraBackdrop direction={direction} cellCount={cellCount} />
        <MobileAllMediaPreviewLayer
          media={media}
          activeKey={activeMediaKey}
          orientation={orientation}
        />
        <LinearSpanInteractionOverlay
          key={`${activeMediaKey}-${orientation}`}
          direction={direction}
          cellCount={cellCount}
          start={start}
          end={end}
          readOnly={readOnly}
          onCommit={onCommit}
          ariaLabel={`Mobile span (${orientation}). Two-click span. Shift+click: one cell.`}
        />
      </Box>
    </Box>
  )
}

export type ProjectSlideGridPlannerDialogProps = {
  open: boolean
  onClose: () => void
  inputProps: ObjectInputProps<ProjectSlideFormValue>
}

export const ProjectSlideGridPlannerDialog = ({
  open,
  onClose,
  inputProps,
}: ProjectSlideGridPlannerDialogProps): ReactElement | null => {
  const { value, onChange, readOnly } = inputProps
  const media = value?.media ?? []

  const [tab, setTab] = useState<PlannerTab>('desktop')
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
    (item: ProjectSlideMediaGridValue) => {
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
    (patches: FormPatch[]) => {
      onChange(patches)
    },
    [onChange],
  )

  if (!open) return null

  const automaticMobileOn = slideAutomaticMobile !== false
  const orientationFormValue = slideMobileOrientation ?? Orientation.PORTRAIT

  return (
    <Dialog
      header="Slide grid planner"
      id="project-slide-grid-planner"
      open
      onClose={onClose}
      width={4}
      zOffset={999}
    >
      <Box padding={4}>
        <Flex gap={5} align="flex-start" wrap="wrap">
          <Stack space={3} style={{ width: 220, flexShrink: 0 }}>
            <Text size={1} weight="semibold">
              Media
            </Text>
            {media.length === 0 ? (
              <Card padding={4} radius={2} tone="transparent" border>
                <Text size={1}>Add media to this slide first.</Text>
              </Card>
            ) : (
              <Stack space={2}>
                {media.map(item =>
                  item._key ? (
                    <ThumbnailRow
                      key={item._key}
                      item={item}
                      selected={item._key === activeMediaKey}
                      hasSpanError={itemHasSpanIssue(item)}
                      onSelect={() => setActiveMediaKey(item._key)}
                    />
                  ) : null,
                )}
              </Stack>
            )}
          </Stack>

          <Stack space={4} flex={1} style={{ minWidth: 280 }}>
            <Card padding={3} radius={2} tone="transparent" border>
              <Stack space={3}>
                <Flex align="center" gap={3} wrap="wrap">
                  <Switch
                    checked={automaticMobileOn}
                    disabled={Boolean(readOnly)}
                    onChange={event => {
                      const checked = event.currentTarget.checked
                      patchSlide([set(checked, ['automaticMobileLayout'])])
                    }}
                  />
                  <Text size={1}>Automatic mobile layout</Text>
                </Flex>
                {!automaticMobileOn ? (
                  <Flex align="center" gap={3} wrap="wrap">
                    <Text size={1}>Mobile orientation</Text>
                    <Select
                      value={orientationFormValue}
                      disabled={Boolean(readOnly)}
                      onChange={event => {
                        patchSlide([set(event.currentTarget.value, ['mobileOrientation'])])
                      }}
                      style={{ minWidth: 160 }}
                    >
                      <option value={Orientation.PORTRAIT}>Portrait</option>
                      <option value={Orientation.LANDSCAPE}>Landscape</option>
                    </Select>
                  </Flex>
                ) : null}
              </Stack>
            </Card>

            <Flex gap={2}>
              <Button
                text="Desktop"
                mode={tab === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setTab('desktop')}
              />
              <Button
                text="Mobile"
                mode={tab === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setTab('mobile')}
              />
            </Flex>

            {tab === 'desktop' ? (
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
                      readOnly={Boolean(readOnly)}
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
                readOnly={Boolean(readOnly)}
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
      </Box>
    </Dialog>
  )
}
