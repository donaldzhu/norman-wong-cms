import createImageUrlBuilder from '@sanity/image-url'
import { Box, Button, Card, Dialog, Flex, Stack, Text, TextInput } from '@sanity/ui'
import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import type { ObjectInputProps } from 'sanity'
import { set, useClient, useFormValue } from 'sanity'
import { SANITY_CLIENT_OPTIONS } from '../constants/configs'


const MIN_CELLS = 10
const MAX_CELLS = 12
const DEFAULT_ROW = 10

type ProjectMedia = {
  _type?: string
  _key: string
  type?: string
  image?: { asset?: { _ref?: string } }
  video?: { asset?: { _ref?: string } }
}

type SelectedWorksProjectValue = {
  _key?: string
  _type?: string
  project?: { _ref?: string }
  media?: ProjectMedia[]
}

type LayoutValue = {
  projects?: SelectedWorksProjectValue[]
  rowSettings?: number[]
}

type StreamItem = {
  media: ProjectMedia
  projectIndex: number
  mediaIndex: number
  isProjectStart: boolean
}

function clampCells(n: number): number {
  return Math.min(MAX_CELLS, Math.max(MIN_CELLS, Math.round(n)))
}

/** Ensure row widths cover the stream; trim trailing rows when possible. */
function normalizeRowSettings(
  rowSettings: number[] | undefined,
  streamLength: number,
): number[] {
  if (streamLength === 0) return []
  let next = [...(rowSettings ?? [])].map(clampCells)
  let sum = () => next.reduce((a, b) => a + b, 0)
  while (sum() < streamLength) {
    next.push(DEFAULT_ROW)
  }
  while (next.length > 1 && next.slice(0, -1).reduce((a, b) => a + b, 0) >= streamLength) {
    next.pop()
  }
  return next
}

function flattenProjectMedia(projects: SelectedWorksProjectValue[] | undefined): StreamItem[] {
  const out: StreamItem[] = []
    ; (projects ?? []).forEach((proj, projectIndex) => {
      const media = proj?.media ?? []
      media.forEach((m, mediaIndex) => {
        if (!m?._key) return
        out.push({
          media: m,
          projectIndex,
          mediaIndex,
          isProjectStart: mediaIndex === 0,
        })
      })
    })
  return out
}

function buildGridRows(
  stream: StreamItem[],
  rowSettings: number[] | undefined,
): { rowIndex: number; cells: StreamItem[]; widthSetting: number }[] {
  if (stream.length === 0) return []
  const settings = normalizeRowSettings(rowSettings, stream.length)
  const rows: { rowIndex: number; cells: StreamItem[]; widthSetting: number }[] = []
  let idx = 0
  let r = 0
  while (idx < stream.length) {
    const widthSetting = r < settings.length ? settings[r] : DEFAULT_ROW
    const take = Math.min(widthSetting, stream.length - idx)
    rows.push({
      rowIndex: r,
      cells: stream.slice(idx, idx + take),
      widthSetting,
    })
    idx += take
    r += 1
  }
  return rows
}

function MediaThumb({
  item,
  isProjectStart,
  imageUrl,
  muxThumbUrl,
}: {
  item: StreamItem
  isProjectStart: boolean
  imageUrl?: string
  muxThumbUrl?: string
}): ReactElement {
  const isVideo = item.media.type === 'video'
  return (
    <Card
      padding={0}
      radius={2}
      overflow="hidden"
      style={{
        aspectRatio: '1',
        flex: '0 0 auto',
        width: 72,
        border: isProjectStart ? '3px solid var(--card-focus-ring-color)' : '1px solid var(--card-border-color)',
        boxSizing: 'border-box',
        background: 'var(--card-muted-bg-color)',
      }}
    >
      {imageUrl ? (
        <img
          alt=""
          src={imageUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : muxThumbUrl ? (
        <img
          alt=""
          src={muxThumbUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Flex align="center" justify="center" height="fill" padding={2}>
          <Text align="center" muted size={0}>
            {isVideo ? 'Video' : '—'}
          </Text>
        </Flex>
      )}
    </Card>
  )
}

export function SelectedWorksGridManagerInput(
  props: ObjectInputProps<LayoutValue>,
): ReactElement {
  const { value, onChange, readOnly, renderDefault, validation = [], path } = props

  const pathArr = path ?? []
  const projectsFromForm = useFormValue([...pathArr, 'projects']) as
    | SelectedWorksProjectValue[]
    | undefined
  const rowSettingsFromForm = useFormValue([...pathArr, 'rowSettings']) as number[] | undefined

  const projects = projectsFromForm ?? value?.projects
  const rowSettings = rowSettingsFromForm ?? value?.rowSettings

  const client = useClient(SANITY_CLIENT_OPTIONS)
  const builder = useMemo(() => createImageUrlBuilder(client), [client])

  const stream = useMemo(() => flattenProjectMedia(projects), [projects])

  const muxAssetIds = useMemo(() => {
    const ids = new Set<string>()
    for (const item of stream) {
      if (item.media.type === 'video' && item.media.video?.asset?._ref) {
        ids.add(item.media.video.asset._ref)
      }
    }
    return [...ids]
  }, [stream])

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

  const [plannerOpen, setPlannerOpen] = useState(false)

  useEffect(() => {
    const next = normalizeRowSettings(rowSettings, stream.length)
    if (JSON.stringify(next) !== JSON.stringify(rowSettings ?? [])) {
      onChange([set(next, ['rowSettings'])])
    }
  }, [onChange, rowSettings, stream.length])

  const gridRows = useMemo(
    () => buildGridRows(stream, rowSettings),
    [stream, rowSettings],
  )

  const patchRowWidth = useCallback(
    (rowIndex: number, width: number) => {
      const base = normalizeRowSettings(rowSettings, stream.length)
      if (rowIndex < 0 || rowIndex >= base.length) return
      const next = [...base]
      next[rowIndex] = clampCells(width)
      onChange([set(next, ['rowSettings'])])
    },
    [onChange, rowSettings, stream.length],
  )

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

  const summary =
    stream.length === 0
      ? 'No media yet — add projects and images below, then open the grid planner.'
      : `${stream.length} image${stream.length === 1 ? '' : 's'} / videos across ${projects?.length ?? 0} project block${(projects?.length ?? 0) === 1 ? '' : 's'}`

  return (
    <Stack space={4}>
      {validationCards}
      <Card padding={3} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Text size={1} muted>
            {summary}
          </Text>
          <Button
            text="Open Grid Planner"
            tone="primary"
            disabled={readOnly}
            onClick={() => setPlannerOpen(true)}
          />
        </Stack>
      </Card>

      {renderDefault(props)}

      {plannerOpen ? (
        <Dialog
          header="Grid planner"
          id="selected-works-grid-planner"
          open
          onClose={() => setPlannerOpen(false)}
          width={5}
          zOffset={800}
        >
          <Box padding={4} style={{ maxHeight: 'min(88vh, 960px)', overflowY: 'auto' }}>
            <Stack space={5}>
              {validationCards}
              <Text muted size={1}>
                Rows reflow from a single master stream (project order preserved). First cell of each
                project has a highlighted border. Each row can show 10–12 cells; overflow adds rows of
                10 by default.
              </Text>
              {stream.length === 0 ? (
                <Card padding={4} radius={2} tone="transparent" border>
                  <Text muted size={1}>
                    Nothing to preview. Add media under Projects first.
                  </Text>
                </Card>
              ) : (
                gridRows.map(row => (
                  <Flex key={row.rowIndex} align="flex-start" gap={4}>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Flex gap={2} wrap="wrap" style={{ rowGap: 8 }}>
                        {row.cells.map(cell => {
                          const ref = cell.media.image?.asset?._ref
                          const imageUrl =
                            cell.media.type !== 'video' && ref
                              ? builder
                                .image({ asset: { _type: 'reference', _ref: ref } })
                                .width(200)
                                .height(200)
                                .fit('crop')
                                .url()
                              : undefined
                          const muxRef = cell.media.video?.asset?._ref
                          const playbackId = muxRef ? muxPlaybackById[muxRef] : undefined
                          const muxThumbUrl =
                            cell.media.type === 'video' && playbackId
                              ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=200&height=200&fit_mode=smartcrop`
                              : undefined
                          return (
                            <MediaThumb
                              key={cell.media._key}
                              item={cell}
                              isProjectStart={cell.isProjectStart}
                              imageUrl={imageUrl}
                              muxThumbUrl={muxThumbUrl}
                            />
                          )
                        })}
                      </Flex>
                    </Box>
                    <Box style={{ width: 120, flexShrink: 0 }}>
                      <Stack space={2}>
                        <Text size={0} weight="semibold">
                          Row {row.rowIndex + 1}
                        </Text>
                        <Text muted size={0}>
                          Cells (10–12)
                        </Text>
                        <TextInput
                          type="number"
                          min={MIN_CELLS}
                          max={MAX_CELLS}
                          value={String(row.widthSetting)}
                          readOnly={readOnly}
                          onChange={e => {
                            const v = parseInt(e.currentTarget.value, 10)
                            if (!Number.isFinite(v)) return
                            patchRowWidth(row.rowIndex, v)
                          }}
                        />
                      </Stack>
                    </Box>
                  </Flex>
                ))
              )}
            </Stack>
          </Box>
          <Flex justify="flex-end" paddingBottom={4} paddingX={4}>
            <Button tone="primary" text="Done" onClick={() => setPlannerOpen(false)} />
          </Flex>
        </Dialog>
      ) : null}
    </Stack>
  )
}
