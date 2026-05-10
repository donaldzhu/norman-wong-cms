import {
  AddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeOpenIcon,
  TrashIcon,
} from '@sanity/icons'
import type { ImageUrlBuilder } from '@sanity/image-url'
import createImageUrlBuilder from '@sanity/image-url'
import { Box, Button, Card, Dialog, Flex, Stack, Text } from '@sanity/ui'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import type { ArrayOfObjectsInputProps } from 'sanity'
import { insert, set, setIfMissing, unset, useClient } from 'sanity'

import { SlideMediaPickerDialog } from './slideMediaPickerDialog'

/** Stable reference — inline `{ apiVersion }` changes every render and can make `useClient` unstable. */
const SANITY_CLIENT_OPTIONS = { apiVersion: '2024-01-01' as const }

type ThumbnailCell = {
  _key: string
  _type?: string
  mediaType?: string
  image?: { _type?: string; asset?: { _ref?: string; _type?: string } }
  video?: { _type?: string; asset?: { _ref?: string } }
}

type ThumbnailRow = {
  _key: string
  _type?: string
  cells?: ThumbnailCell[]
}

/** Fixed tile width so 10–12 cells stay readable; row scrolls horizontally with arrows. */
const CAROUSEL_CELL_PX = 140
const CAROUSEL_GAP_PX = 10

function newDocumentKey(): string {
  return [...Array(12)]
    .map(() => '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)])
    .join('')
}

/** Which thumbnail array we’re editing — walk path; last segment alone is wrong when focus is inside a cell. */
function thumbnailRowsFieldFromPath(path: readonly unknown[]): 'desktop' | 'mobile' | null {
  for (let i = path.length - 1; i >= 0; i--) {
    const s = path[i]
    if (s === 'mobileThumbnailRows') return 'mobile'
    if (s === 'desktopThumbnailRows') return 'desktop'
  }
  return null
}

type ThumbnailRowCarouselProps = {
  rowKey: string
  cells: ThumbnailCell[]
  readOnly: boolean
  muxPlaybackById: Record<string, string>
  builder: ImageUrlBuilder
  onCellClick: (rowKey: string, cellKey: string) => void
  onClearCell: (rowKey: string, cellKey: string) => void
}

function ThumbnailRowCarousel({
  rowKey,
  cells,
  readOnly,
  muxPlaybackById,
  builder,
  onCellClick,
  onClearCell,
}: ThumbnailRowCarouselProps): ReactElement {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const syncArrows = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = Math.max(0, scrollWidth - clientWidth)
    setCanPrev(scrollLeft > 4)
    setCanNext(scrollLeft < maxScroll - 4)
  }, [])

  useLayoutEffect(() => {
    syncArrows()
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(() => syncArrows())
    ro.observe(el)
    return () => ro.disconnect()
  }, [syncArrows, cells.length])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onScroll = () => syncArrows()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [syncArrows])

  const scrollByPage = useCallback(
    (dir: -1 | 1) => {
      const el = viewportRef.current
      if (!el) return
      const step = Math.max(CAROUSEL_CELL_PX + CAROUSEL_GAP_PX, Math.floor(el.clientWidth * 0.7))
      el.scrollBy({ left: dir * step, behavior: 'smooth' })
    },
    [],
  )

  return (
    <Flex align="stretch" gap={2}>
      <Button
        type="button"
        icon={ChevronLeftIcon}
        mode="ghost"
        paddingX={2}
        disabled={readOnly || !canPrev}
        aria-label="Show previous thumbnails"
        onClick={() => scrollByPage(-1)}
      />
      <Box
        ref={viewportRef}
        style={{
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'thin',
          scrollSnapType: 'x proximity',
        }}
      >
        <Flex gap={2} style={{ width: 'max-content', paddingBottom: 2 }}>
          {cells.map(cell => {
            const imageRef =
              cell.mediaType === 'video'
                ? undefined
                : (cell.image?.asset?._ref as string | undefined)
            const imageUrl =
              imageRef &&
              builder
                .image({ asset: { _type: 'reference', _ref: imageRef } })
                .width(320)
                .height(320)
                .fit('crop')
                .url()
            const muxRef = cell.video?.asset?._ref as string | undefined
            const playbackId = muxRef ? muxPlaybackById[muxRef] : undefined
            const muxThumbUrl =
              cell.mediaType === 'video' && playbackId
                ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=320&height=320&fit_mode=smartcrop`
                : undefined

            return (
              <Stack
                key={cell._key}
                space={2}
                style={{
                  flex: '0 0 auto',
                  width: CAROUSEL_CELL_PX,
                  scrollSnapAlign: 'start',
                }}
              >
                <Card
                  as="button"
                  type="button"
                  disabled={readOnly}
                  padding={0}
                  radius={2}
                  tone="default"
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    width: '100%',
                    cursor: readOnly ? 'default' : 'pointer',
                    border: '1px solid var(--card-border-color)',
                    overflow: 'hidden',
                    background: 'var(--card-muted-bg-color)',
                  }}
                  onClick={() => {
                    if (!readOnly) onCellClick(rowKey, cell._key)
                  }}
                >
                  {imageUrl ? (
                    <img
                      alt=""
                      src={imageUrl}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : muxThumbUrl ? (
                    <img
                      alt=""
                      src={muxThumbUrl}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : cell.mediaType === 'video' && cell.video?.asset?._ref ? (
                    <Flex align="center" justify="center" height="fill" padding={2}>
                      <Text align="center" muted size={0}>
                        Video
                      </Text>
                    </Flex>
                  ) : (
                    <Flex align="center" justify="center" height="fill" padding={2}>
                      <Text align="center" muted size={0}>
                        Choose media
                      </Text>
                    </Flex>
                  )}
                </Card>
                {(imageRef || cell.mediaType === 'video') && !readOnly ? (
                  <Button
                    text="Clear"
                    mode="ghost"
                    fontSize={0}
                    paddingY={1}
                    onClick={() => onClearCell(rowKey, cell._key)}
                  />
                ) : null}
              </Stack>
            )
          })}
        </Flex>
      </Box>
      <Button
        type="button"
        icon={ChevronRightIcon}
        mode="ghost"
        paddingX={2}
        disabled={readOnly || !canNext}
        aria-label="Show next thumbnails"
        onClick={() => scrollByPage(1)}
      />
    </Flex>
  )
}

export function SelectedWorksThumbnailRowsInput(
  props: ArrayOfObjectsInputProps,
): ReactElement {
  const { onChange, value = [], readOnly, path, schemaType, validation = [] } = props
  const dialogTitle = schemaType.title ?? 'Thumbnail rows'
  const client = useClient(SANITY_CLIENT_OPTIONS)
  const builder = useMemo(() => createImageUrlBuilder(client), [client])

  const rowsField = thumbnailRowsFieldFromPath(path ?? [])
  const addChoices: number[] = rowsField === 'mobile' ? [4, 5, 6] : [10, 11, 12]

  const muxAssetIds = useMemo(() => {
    const ids = new Set<string>()
    for (const row of value as ThumbnailRow[]) {
      for (const c of row.cells ?? []) {
        const ref = c.video?.asset?._ref
        if (c.mediaType === 'video' && ref) ids.add(ref)
      }
    }
    return [...ids]
  }, [value])

  const [muxPlaybackById, setMuxPlaybackById] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!muxAssetIds.length) {
      setMuxPlaybackById(prev => (Object.keys(prev).length === 0 ? prev : {}))
      return
    }
    let cancelled = false
    client
      .fetch<Array<{ _id: string; playbackId?: string }>>(
        `*[_type == "mux.videoAsset" && _id in $ids]{ _id, playbackId }`,
        { ids: muxAssetIds },
      )
      .then(rows => {
        if (cancelled) return
        const next: Record<string, string> = {}
        for (const r of rows) {
          if (r.playbackId) next[r._id] = r.playbackId
        }
        setMuxPlaybackById(next)
      })
      .catch(() => {
        if (!cancelled) setMuxPlaybackById({})
      })
    return () => {
      cancelled = true
    }
  }, [client, muxAssetIds])

  const [editorOpen, setEditorOpen] = useState(false)
  const [addRowOpen, setAddRowOpen] = useState(false)
  const [newRowCells, setNewRowCells] = useState<number>(() => addChoices[0] ?? 10)
  const [picker, setPicker] = useState<{ rowKey: string; cellKey: string } | null>(null)

  const rows = value as ThumbnailRow[]
  const rowCount = rows.length
  const cellCount = useMemo(
    () => rows.reduce((acc, r) => acc + (r.cells?.length ?? 0), 0),
    [rows],
  )

  useEffect(() => {
    if (!editorOpen) {
      setAddRowOpen(false)
      setPicker(null)
    }
  }, [editorOpen])

  const appendRow = useCallback(
    (cellCount: number) => {
      const rowKey = newDocumentKey()
      const cells: ThumbnailCell[] = Array.from({ length: cellCount }, () => ({
        _type: 'selectedWorksThumbnail',
        _key: newDocumentKey(),
        mediaType: 'image',
      }))
      const row: ThumbnailRow = {
        _type: 'selectedWorksThumbnailRow',
        _key: rowKey,
        cells,
      }
      onChange([setIfMissing([]), insert([row], 'after', [-1])])
    },
    [onChange],
  )

  const handleConfirmAddRow = useCallback(() => {
    if (!addChoices.includes(newRowCells)) return
    appendRow(newRowCells)
    setAddRowOpen(false)
  }, [addChoices, appendRow, newRowCells])

  const removeRow = useCallback(
    (rowKey: string) => {
      onChange([unset([{ _key: rowKey }])])
    },
    [onChange],
  )

  const applyImageToCell = useCallback(
    (rowKey: string, cellKey: string, assetRef: string) => {
      onChange([
        set('image', [{ _key: rowKey }, 'cells', { _key: cellKey }, 'mediaType']),
        set(
          { _type: 'image', asset: { _type: 'reference', _ref: assetRef } },
          [{ _key: rowKey }, 'cells', { _key: cellKey }, 'image'],
        ),
        unset([{ _key: rowKey }, 'cells', { _key: cellKey }, 'video']),
      ])
    },
    [onChange],
  )

  const applyVideoToCell = useCallback(
    (rowKey: string, cellKey: string, muxAssetRef: string) => {
      onChange([
        set('video', [{ _key: rowKey }, 'cells', { _key: cellKey }, 'mediaType']),
        set(
          { _type: 'mux.video', asset: { _type: 'reference', _ref: muxAssetRef } },
          [{ _key: rowKey }, 'cells', { _key: cellKey }, 'video'],
        ),
        unset([{ _key: rowKey }, 'cells', { _key: cellKey }, 'image']),
      ])
    },
    [onChange],
  )

  const clearCell = useCallback(
    (rowKey: string, cellKey: string) => {
      onChange([
        set('image', [{ _key: rowKey }, 'cells', { _key: cellKey }, 'mediaType']),
        unset([{ _key: rowKey }, 'cells', { _key: cellKey }, 'image']),
        unset([{ _key: rowKey }, 'cells', { _key: cellKey }, 'video']),
      ])
    },
    [onChange],
  )

  const handleCellClick = useCallback((rowKey: string, cellKey: string) => {
    setPicker({ rowKey, cellKey })
  }, [])

  const editorBody = (
    <>
      <Stack space={5}>
        {rows.map(row => {
          const cells = row.cells ?? []
          const n = cells.length
          return (
            <Card key={row._key} padding={3} radius={2} tone="transparent" border>
              <Flex justify="space-between" align="center" marginBottom={3} gap={2}>
                <Text size={1} weight="semibold">
                  Row ({n} {n === 1 ? 'cell' : 'cells'})
                </Text>
                <Button
                  icon={TrashIcon}
                  mode="ghost"
                  tone="critical"
                  text="Remove row"
                  disabled={readOnly}
                  onClick={() => removeRow(row._key)}
                />
              </Flex>
              <ThumbnailRowCarousel
                rowKey={row._key}
                cells={cells}
                readOnly={!!readOnly}
                muxPlaybackById={muxPlaybackById}
                builder={builder}
                onCellClick={handleCellClick}
                onClearCell={clearCell}
              />
            </Card>
          )
        })}
      </Stack>

      <Flex gap={2} wrap="wrap" marginTop={4}>
        <Button
          icon={AddIcon}
          text="Add row"
          mode="ghost"
          disabled={readOnly}
          onClick={() => {
            setNewRowCells(addChoices[0] ?? 10)
            setAddRowOpen(true)
          }}
        />
      </Flex>
    </>
  )

  const summaryText =
    rowCount === 0
      ? 'No rows yet — open the editor to add thumbnail rows.'
      : `${rowCount} row${rowCount === 1 ? '' : 's'} · ${cellCount} cell${cellCount === 1 ? '' : 's'}`

  const validationTone = (level: string): 'critical' | 'caution' | 'transparent' => {
    if (level === 'error') return 'critical'
    if (level === 'warning') return 'caution'
    return 'transparent'
  }

  const validationCards = validation.map((marker, i) => (
    <Card key={i} padding={3} radius={2} tone={validationTone(marker.level)}>
      <Text size={1}>{marker.message}</Text>
    </Card>
  ))

  return (
    <Stack space={3}>
      {validationCards}
      <Card padding={3} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Text size={1} muted>
            {summaryText}
          </Text>
          <Button
            icon={EyeOpenIcon}
            text={readOnly ? 'Preview rows' : 'Preview & edit rows'}
            tone="primary"
            onClick={() => setEditorOpen(true)}
          />
        </Stack>
      </Card>

      {editorOpen ? (
        <Dialog
          header={dialogTitle}
          id="selected-works-thumbnail-rows-editor"
          open
          onClose={() => setEditorOpen(false)}
          width={4}
          zOffset={700}
        >
          <Box
            padding={4}
            style={{ maxHeight: 'min(85vh, 900px)', overflowY: 'auto' }}
          >
            <Stack space={4}>
              {validationCards}
              {editorBody}
            </Stack>
          </Box>
          <Flex justify="flex-end" paddingBottom={4} paddingX={4} gap={2}>
            <Button text="Done" tone="primary" onClick={() => setEditorOpen(false)} />
          </Flex>
        </Dialog>
      ) : null}

      {addRowOpen ? (
        <Dialog
          header="New row"
          id="selected-works-add-row"
          open
          onClose={() => setAddRowOpen(false)}
          width={0}
          zOffset={900}
        >
          <Stack padding={4} space={4}>
            <Text muted size={1}>
              How many cells should this row have?
            </Text>
            <Flex gap={2} wrap="wrap">
              {addChoices.map(c => (
                <Button
                  key={c}
                  text={`${c}`}
                  mode={newRowCells === c ? 'default' : 'ghost'}
                  disabled={readOnly}
                  onClick={() => setNewRowCells(c)}
                />
              ))}
            </Flex>
            <Flex gap={2} justify="flex-end">
              <Button text="Cancel" mode="ghost" onClick={() => setAddRowOpen(false)} />
              <Button text="Add row" tone="primary" onClick={handleConfirmAddRow} />
            </Flex>
          </Stack>
        </Dialog>
      ) : null}

      {picker ? (
        <SlideMediaPickerDialog
          onClose={() => setPicker(null)}
          onPickImage={ref => applyImageToCell(picker.rowKey, picker.cellKey, ref)}
          onPickVideo={id => applyVideoToCell(picker.rowKey, picker.cellKey, id)}
        />
      ) : null}
    </Stack>
  )
}
