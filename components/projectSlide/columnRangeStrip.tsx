import { Box, Flex, Text } from '@sanity/ui'
import { useClickAway } from '@uidotdev/usehooks'
import { useCallback, useState, type CSSProperties, type MouseEvent, type ReactElement } from 'react'

import {
  DESKTOP_COLUMN_COUNT,
  cellIsInSpan,
  spanFromClickedCells,
  getSpanFromSingleCell,
} from '../../utils/columnRange'

export type ColumnRangeStripLayout = 'desktop' | 'mobile'
export type ColumnRangeStripAxis = 'column' | 'row'

export type ColumnRangeStripProps = {
  title: string
  description?: string
  layout?: ColumnRangeStripLayout
  axis?: ColumnRangeStripAxis
  cellCount?: number
  /** Start edge index. */
  start: number | undefined
  /** End edge index; span covers cells start … end − 1. */
  end: number | undefined
  readOnly?: boolean
  onCommit: (start: number, end: number) => void
  onClear?: () => void
}

/**
 * One-dimensional range strip. Stored values are edge indices.
 * First click commits one cell; second click after the anchor extends forward.
 */
export function ColumnRangeStrip(props: ColumnRangeStripProps): ReactElement {
  const {
    title,
    description,
    layout = 'desktop',
    axis = 'column',
    cellCount = DESKTOP_COLUMN_COUNT,
    start,
    end,
    readOnly,
    onCommit,
    onClear,
  } = props

  /** Anchor cell for the optional second click that extends the span. */
  const [pendingAnchor, setPendingAnchor] = useState<number | null>(null)
  const containerRef = useClickAway<HTMLDivElement>(() => setPendingAnchor(null))

  const handleColumnClick = useCallback(
    (cell: number, event: MouseEvent<HTMLButtonElement>) => {
      if (readOnly) return

      if (event.shiftKey || pendingAnchor == null) {
        const { start: s, end: e } = getSpanFromSingleCell(cell)
        onCommit(s, e)
        setPendingAnchor(cell)
        return
      }

      if (cell <= pendingAnchor) {
        const { start: s, end: e } = getSpanFromSingleCell(cell)
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

  const isDesktop = layout === 'desktop'
  const stripStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: axis === 'column' ? `repeat(${cellCount}, minmax(0, 1fr))` : '1fr',
    gridTemplateRows: axis === 'row' ? `repeat(${cellCount}, minmax(0, 1fr))` : '1fr',
    gap: 1,
    aspectRatio: isDesktop ? '2 / 1' : '1 / 2',
    width: isDesktop ? '100%' : '50%',
    maxWidth: '100%',
    background: 'var(--card-border-color, rgba(127,127,127,0.22))',
  }

  const unitLabel = axis === 'row' ? 'Row' : 'Column'
  const rangeLabel =
    start != null && end != null ? `${unitLabel}: ${start}–${end}` : `${unitLabel}: —`

  return (
    <Box ref={containerRef}>
      <Flex align="flex-end" justify="space-between" gap={3} wrap="wrap">
        <Box flex={1} style={{ minWidth: 0 }}>
          <Text size={1} weight="semibold">
            {title}
          </Text>
          {description ? (
            <Text muted size={1} style={{ marginTop: 2, lineHeight: 1.35, display: 'block' }}>
              {description}
            </Text>
          ) : null}
        </Box>
        <Flex align="center" gap={3} style={{ flexShrink: 0 }}>
          {onClear ? (
            <button
              type="button"
              disabled={readOnly}
              onClick={() => {
                onClear()
                setPendingAnchor(null)
              }}
              style={{
                appearance: 'none',
                background: 'transparent',
                border: 0,
                cursor: readOnly ? 'default' : 'pointer',
                margin: 0,
                padding: 0,
              }}
            >
              <Text muted size={1}>
                Clear
              </Text>
            </button>
          ) : null}
          <Text muted size={1} style={{ lineHeight: 1.2 }}>
            {rangeLabel}
          </Text>
        </Flex>
      </Flex>

      <Box marginTop={2}>
        <Box role="group" aria-label={`${title}. Two-click span. Shift+click: one cell.`} style={stripStyle}>
          {cells.map(col => {
            const selected =
              start != null && end != null && cellIsInSpan(col, start, end)
            const zebra =
              col % 2 === 0 ? 'rgba(127,127,127,0.18)' : 'rgba(127,127,127,0.08)'

            return (
              <button
                key={col}
                type="button"
                disabled={readOnly}
                onClick={event => handleColumnClick(col, event)}
                title={`${unitLabel} ${col}`}
                style={{
                  position: 'relative',
                  margin: 0,
                  padding: '2px 1px 4px',
                  minWidth: 0,
                  minHeight: 0,
                  border: 0,
                  borderRadius: 0,
                  cursor: readOnly ? 'default' : 'pointer',
                  opacity: readOnly ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  overflow: 'hidden',
                  background: 'var(--card-bg-color)',
                  boxShadow: selected
                    ? 'inset 0 0 0 1px var(--card-bg-color, #fff)'
                    : undefined,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: zebra,
                    pointerEvents: 'none',
                    borderRadius: 1,
                  }}
                />
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: selected
                      ? 'var(--sanity-color-accent-fg, #2276fc)'
                      : 'transparent',
                    opacity: selected ? 0.92 : 0,
                    pointerEvents: 'none',
                  }}
                />
                <Text
                  size={1}
                  muted={!selected}
                  style={{
                    position: 'relative',
                    fontSize: 9,
                    lineHeight: 1,
                    color: selected ? 'var(--card-bg-color, #fff)' : undefined,
                    opacity: selected ? 1 : 0.42,
                    userSelect: 'none',
                  }}
                >
                  {col}
                </Text>
              </button>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
