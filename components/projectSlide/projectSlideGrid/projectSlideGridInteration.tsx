import { DESKTOP_COLUMN_COUNT, MOBILE_LANDSCAPE_COLUMN_COUNT, MOBILE_PORTRAIT_ROW_COUNT } from './configs'
import { DeviceType, GridSpan } from './types'
import {
  cellIsInSpan,
  getSpanFromSingleCell,
  spanFromClickedCells,
} from '../../../utils/columnRange'

import { Box } from '@sanity/ui'
import { Orientation } from '../../../constants/enum'
import { getGridStyle } from './utils'
import { useState } from 'react'

interface ProjectSlideGridInterationProps {
  start?: number
  end?: number
  orientation?: Orientation
  tab: DeviceType
  onCommit: (span: GridSpan) => void
}
export const ProjectSlideGridInteration = ({
  start,
  end,
  tab,
  orientation = Orientation.LANDSCAPE,
  onCommit,
}: ProjectSlideGridInterationProps) => {
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

  const cellCount = tab === DeviceType.DESKTOP ? DESKTOP_COLUMN_COUNT : orientation === Orientation.LANDSCAPE ? MOBILE_LANDSCAPE_COLUMN_COUNT : MOBILE_PORTRAIT_ROW_COUNT

  return (
    <Box style={{
      ...getGridStyle(tab, orientation),
      zIndex: 0,
    }}>
      {Array(cellCount).fill(0).map((_, i) => i + 1)
        .map(col => {
          const selected = start != null && end != null && cellIsInSpan(col, start, end)
          return (
            <button
              key={col}
              type="button"
              onClick={() => onCellClick(col)}
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

            </button>
          )
        })}
    </Box>
  )
}
