import { DESKTOP_COLUMN_COUNT, GRID_STYLE } from './configs'
import {
  cellIsInSpan,
  getSpanFromSingleCell,
  spanFromClickedCells,
} from '../../../utils/columnRange'

import { Box } from '@sanity/ui'
import type { GridSpan } from './types'
import { useState } from 'react'

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

  const onCellClick = (cell: number) => {
    if (startingAnchor === null || cell <= startingAnchor) {
      onCommit(getSpanFromSingleCell(cell))
      setStartingAnchor(cell)
      return
    }

    onCommit(spanFromClickedCells(startingAnchor, cell))
    setStartingAnchor(null)
  }

  return (
    <Box style={{
      ...GRID_STYLE,
      zIndex: 999,
    }}>
      {Array(DESKTOP_COLUMN_COUNT).fill(0).map((_, i) => i + 1)
        .map(col => {
          const selected = start != null && end != null && cellIsInSpan(col, start, end)
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
                  background: 'rgba(127,127,127,0.125)',
                  opacity: col % 2 === 0 ? 1 : 0.5,
                  pointerEvents: 'none',
                }}
              />
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: selected ? 'var(--card-focus-ring-color)' : 'transparent',
                  opacity: selected ? 0.2 : 0,
                  pointerEvents: 'none',
                }}
              />
            </button>
          )
        })}
    </Box>
  )
}
