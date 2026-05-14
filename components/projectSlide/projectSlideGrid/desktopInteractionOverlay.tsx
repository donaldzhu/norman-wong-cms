import { Box } from '@sanity/ui'
import { useCallback, useState, type CSSProperties, type MouseEvent } from 'react'

import {
  DESKTOP_COLUMN_COUNT,
  cellIsInSpan,
  spanFromClickedCells,
  spanFromSingleCell,
} from '../../../utils/columnRange'

export const DesktopInteractionOverlay = ({
  start,
  end,
  onCommit,
}: {
  start: number | undefined
  end: number | undefined
  onCommit: (start: number, end: number) => void
}) => {
  const [pendingAnchor, setPendingAnchor] = useState<number | null>(null)

  const handleCellClick = useCallback(
    (cell: number, event: MouseEvent<HTMLButtonElement>) => {

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
    [pendingAnchor, onCommit],
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
              cursor: 'pointer',
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
