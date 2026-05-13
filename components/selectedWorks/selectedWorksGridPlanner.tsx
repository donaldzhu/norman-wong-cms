import { Box, Card, Dialog, Flex, Stack, Text, TextInput } from '@sanity/ui'
import { set, useFormValue } from 'sanity'
import { useCallback, useMemo } from 'react'

import { MediaRefPreview } from '../previews/mediaRefPreview'
import { MediaType } from '../../constants/enum'
import type { ObjectInputProps } from 'sanity'
import _ from 'lodash'

export interface SelectedWorksLayoutFormValue {
  rowSettings?: number[]
}

export interface CellRange { min: number; max: number }

export interface RowSetting {
  rowIndex: number
  cells: ProjectListItem[]
  width: number
}

export interface ProjectMedia {
  _type?: string
  _key: string
  type?: string
  image?: { asset?: { _ref?: string } }
  video?: { asset?: { _ref?: string } }
}

export interface SelectedWorksProject {
  _key?: string
  _type?: string
  project?: { _ref?: string }
  media?: ProjectMedia[]
}

export interface ProjectListItem {
  media: ProjectMedia
  projectIndex: number
  mediaIndex: number
  isProjectStart: boolean
}

export const getCellRange = (options?: { min?: number; max?: number }): CellRange =>
  ({ min: options?.min ?? 10, max: options?.max ?? 12 })

export const autoPopulateRowSettings = (
  rowSettings: number[] | undefined,
  projectListLength: number,
  { min }: CellRange,
) => {
  if (projectListLength === 0 || !rowSettings) return []
  const normalized = [...rowSettings]
  const DEFAULT_ROW_SIZE = min

  while (_.sum(normalized) < projectListLength)
    normalized.push(DEFAULT_ROW_SIZE)
  while (normalized.length > 1 && _.sum(normalized.slice(0, -1)) >= projectListLength)
    normalized.pop()

  return normalized
}

export const flattenProjectList = (projects: SelectedWorksProject[] = []) => {
  const out: ProjectListItem[] = []
  projects.forEach((proj, projectIndex) => {
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

export const buildGridRows = (
  projectList: ProjectListItem[],
  rowSettings: number[] | undefined,
  range: CellRange,
) => {

  rowSettings = autoPopulateRowSettings(rowSettings, projectList.length, range)
  const rows: RowSetting[] = []
  let projectIndex = 0
  let rowIndex = 0

  while (projectIndex < projectList.length) {
    const width = rowSettings[rowIndex] ?? range.min
    const rowTakes = Math.min(width, projectList.length - projectIndex)
    rows.push({
      rowIndex,
      cells: projectList.slice(projectIndex, projectIndex + rowTakes),
      width,
    })
    projectIndex += rowTakes
    rowIndex++
  }

  return rows
}

const GridPlannerMediaCell = ({ cell }: { cell: ProjectListItem }) => {
  const isVideo = cell.media.type === MediaType.VIDEO
  const mediaWithRef = isVideo ? cell.media.video : cell.media.image
  const hasRef = Boolean(mediaWithRef?.asset?._ref)

  return (
    <Card
      padding={0}
      radius={2}
      overflow="hidden"
      style={{
        aspectRatio: '1',
        flex: '0 0 auto',
        width: 72,
        border: cell.isProjectStart
          ? '3px solid var(--card-focus-ring-color)'
          : '1px solid var(--card-border-color)',
        boxSizing: 'border-box',
        background: 'var(--card-muted-bg-color)',
      }}
    >
      {hasRef ? (
        <MediaRefPreview
          mediaType={isVideo ? MediaType.VIDEO : MediaType.IMAGE}
          mediaWithRef={mediaWithRef}
          sanityImageWidth={200}
          showSpinner={isVideo}
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

export type SelectedWorksGridPlannerDialogProps = {
  open: boolean
  onClose: () => void
  inputProps: ObjectInputProps<SelectedWorksLayoutFormValue>
}

export const SelectedWorksGridPlannerDialog = ({
  open,
  onClose,
  inputProps,
}: SelectedWorksGridPlannerDialogProps) => {
  const { value, onChange, schemaType } = inputProps

  const range = useMemo<CellRange>(() => getCellRange(schemaType?.options), [schemaType?.options])
  const isMobile = range.min < 10

  const projects = useFormValue(['projects']) as SelectedWorksProject[] | undefined
  const rowSettings = value?.rowSettings
  const projectList = useMemo(() => flattenProjectList(projects), [projects])

  const gridRows = useMemo(
    () => buildGridRows(projectList, rowSettings, range),
    [projectList, rowSettings, range],
  )

  const onRowWidthChange = useCallback(({ currentTarget }: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const width = parseInt(currentTarget.value)
    const currentRowSettings = autoPopulateRowSettings(rowSettings, projectList.length, range)
    if (rowIndex < 0 || rowIndex >= currentRowSettings.length) return
    const newRowSettings = [...currentRowSettings]
    newRowSettings[rowIndex] = _.clamp(width, range.min, range.max)
    onChange([set(newRowSettings, ['rowSettings'])])
  }, [onChange, range, rowSettings, projectList.length])


  if (!open) return null

  return (
    <Dialog
      header="Grid planner"
      id="selected-works-grid-planner"
      open
      onClose={onClose}
      width={isMobile ? 2 : 3}
      zOffset={999}
    >
      <Box padding={4} >
        <Stack space={5}>
          <Text muted size={1}>
            Rows reflow from a single master projectList (project order preserved). First cell of each
            project has a highlighted border. Each row can show {range.min}
            {range.min === range.max ? '' : `–${range.max}`} cells; overflow adds rows
            of {range.min} by default.
          </Text>
          {projectList.length === 0 ? (
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
                    {row.cells.map(cell => (
                      <GridPlannerMediaCell key={cell.media._key} cell={cell} />
                    ))}
                  </Flex>
                </Box>
                <Box style={{ width: 120, flexShrink: 0 }}>
                  <Stack space={2}>
                    <Text size={0} weight="semibold">
                      Row {row.rowIndex + 1}
                    </Text>
                    <Text muted size={0}>
                      Cells ({range.min}
                      {range.min === range.max ? '' : `–${range.max}`})
                    </Text>
                    <TextInput
                      type="number"
                      min={range.min}
                      max={range.max}
                      value={String(row.width)}
                      onChange={e => onRowWidthChange(e, row.rowIndex)}
                    />
                  </Stack>
                </Box>
              </Flex>
            ))
          )}
        </Stack>
      </Box>
    </Dialog>
  )
}
