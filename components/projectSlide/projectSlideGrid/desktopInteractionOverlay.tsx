import { Box } from '@sanity/ui'
import { useCallback, useState, type CSSProperties } from 'react'

import {
  DESKTOP_COLUMN_COUNT,
  cellIsInSpan,
  spanFromClickedCells,
  getSpanFromSingleCell,
} from '../../../utils/columnRange'
import type { GridSpan } from './types'

interface DesktopInteractionOverlayProps {
  start?: number
  end?: number
  onCommit: (span: GridSpan) => void
}
export const DesktopInteractionOverlay = ({
  start,
  end,
  onCommit,
}: DesktopInteractionOverlayProps) => {
  const [startingAnchor, setStartingAnchor] = useState<number | null>(null)

  const onCellClick = useCallback(
    (cell: number) => {
      if (startingAnchor == null || cell <= startingAnchor) {
        onCommit(getSpanFromSingleCell(cell))
        return setStartingAnchor(cell)
      }

      onCommit(spanFromClickedCells(startingAnchor, cell))
      setStartingAnchor(null)
    },
    [startingAnchor, onCommit],
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
            onClick={() => onCellClick(col)}
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
