import type { AssetRef, Ref } from '../types/media'
import { Box, Button, Card, Dialog, Flex, Stack, Text } from '@sanity/ui'
import { ChevronDownIcon, ChevronUpIcon } from '@sanity/icons'
import { set, useFormValue } from 'sanity'
import { useCallback, useMemo } from 'react'

import { MediaRefPreview } from '../previews/mediaRefPreview'
import { MediaType } from '../../constants/enum'
import type { ObjectInputProps } from 'sanity'
import _ from 'lodash'
import { useClickAway } from '@uidotdev/usehooks'

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
  _key: string
  type?: string
  image?: AssetRef
  video?: AssetRef
  hideOnMobile?: boolean
}

export interface SelectedWorksProject {
  _key?: string
  project?: Ref
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
  if (projectListLength === 0) return []
  const normalized = [...(rowSettings ?? [])]
  const DEFAULT_ROW_SIZE = min

  while (_.sum(normalized) < projectListLength)
    normalized.push(DEFAULT_ROW_SIZE)
  while (normalized.length > 1 && _.sum(normalized.slice(0, -1)) >= projectListLength)
    normalized.pop()

  return normalized
}

export const flattenProjectList = (
  projects: SelectedWorksProject[] = [],
  isMobile: boolean = false,
) => {
  const out: ProjectListItem[] = []
  projects.forEach((proj, projectIndex) => {
    const media = proj?.media ?? []
    media.forEach((m, mediaIndex) => {
      if (!m?._key || (isMobile && m.hideOnMobile)) return
      const isProjectStart = !isMobile ?
        mediaIndex === 0 :
        media.findIndex(m => !m.hideOnMobile) === mediaIndex
      out.push({
        media: m,
        projectIndex,
        mediaIndex,
        isProjectStart,
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
      radius={2}
      overflow="hidden"
      style={{
        aspectRatio: '1',
        flex: '0 0 auto',
        width: 60,
        boxShadow: cell.isProjectStart ? '0 0 3px 2px var(--card-focus-ring-color)' : undefined,
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

interface RowWidthStepperProps {
  rowIndex: number
  width: number
  range: CellRange
  onChange: (rowIndex: number, width: number) => void
}

const RowWidthStepper = ({ rowIndex, width, range, onChange }: RowWidthStepperProps) =>
(
  <Flex align="center" gap={3}>
    <Stack space={1}>
      <Button
        icon={ChevronUpIcon}
        mode="ghost"
        padding={1}
        disabled={width >= range.max}
        aria-label="Increase cells per row"
        onClick={() => onChange(rowIndex, width + 1)}
      />
      <Button
        icon={ChevronDownIcon}
        mode="ghost"
        padding={1}
        disabled={width <= range.min}
        aria-label="Decrease cells per row"
        onClick={() => onChange(rowIndex, width - 1)}
      />
    </Stack>
    <Text size={2} weight="semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {width}
    </Text>
  </Flex>
)

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
  const projectList = useMemo(() => flattenProjectList(projects, isMobile), [projects, isMobile])

  const gridRows = useMemo(
    () => buildGridRows(projectList, rowSettings, range),
    [projectList, rowSettings, range],
  )

  const containerRef = useClickAway<HTMLDivElement>(onClose)

  const handleChange = useCallback(
    (rowIndex: number, newWidth: number) => {
      const baseline = autoPopulateRowSettings(rowSettings, projectList.length, range)
      if (rowIndex < 0 || rowIndex >= baseline.length) return
      const newRowSettings = [...baseline]
      newRowSettings[rowIndex] = _.clamp(newWidth, range.min, range.max)
      onChange([set(newRowSettings, ['rowSettings'])])
    },
    [onChange, projectList.length, range, rowSettings],
  )

  if (!open) return null

  return (
    <Dialog
      header={`${isMobile ? 'Mobile' : 'Desktop'} Grid planner`}
      id="selected-works-grid-planner"
      open
      onClose={onClose}
      width={3}
      zOffset={999}
    >
      <Box padding={4} ref={containerRef}>
        <Stack >
          {projectList.length === 0 ? (
            <Card padding={4} radius={2} tone="transparent" border>
              <Text muted size={1}>
                Nothing to preview. Add media under Projects first.
              </Text>
            </Card>
          ) : (
            gridRows.map((row, i) => (
              <Flex
                key={`row-index-${i}`}
                align="center"
                gap={6}
                padding={[0, 0, 4, 4]}
                style={{ borderBottom: i === gridRows.length - 1 ? 'none' : '1px solid var(--card-border-color)' }}
              >
                <RowWidthStepper
                  rowIndex={row.rowIndex}
                  width={row.width}
                  range={range}
                  onChange={handleChange}
                />
                <Box style={{ flex: 1 }}>
                  <Flex gap={3} wrap="wrap">
                    {row.cells.map(cell => (
                      <GridPlannerMediaCell key={cell.media._key} cell={cell} />
                    ))}
                  </Flex>
                </Box>

              </Flex>
            ))
          )}
        </Stack>
      </Box>
    </Dialog >
  )
}
