import { DESKTOP_COLUMN_COUNT, MOBILE_LANDSCAPE_COLUMN_COUNT, MOBILE_PORTRAIT_ROW_COUNT } from './configs'
import { DeviceType, GridSpan } from '../types/selectedWorks'
import {
  getSpanFromCells,
  getSpanFromSingleCell
} from '../../utils/columnRange'

import { Box } from '@sanity/ui'
import { Orientation } from '../../constants/enum'
import { getGridStyle } from '../../utils/projectSlide'
import { useState } from 'react'

interface ProjectSlideGridInteractionProps {
  start?: number
  end?: number
  orientation?: Orientation
  tab: DeviceType
  onCommit: (span: GridSpan) => void
}
export const ProjectSlideGridInteraction = ({
  start,
  end,
  tab,
  orientation = Orientation.LANDSCAPE,
  onCommit,
}: ProjectSlideGridInteractionProps) => {
  const [startingAnchor, setStartingAnchor] = useState<number | null>(null)

  const onCellClick = (cell: number) => {
    if (startingAnchor === null || cell <= startingAnchor) {
      onCommit(getSpanFromSingleCell(cell))
      setStartingAnchor(cell)
      return
    }

    onCommit(getSpanFromCells(startingAnchor, cell))
    setStartingAnchor(null)
  }

  const cellCount = tab === DeviceType.DESKTOP ? DESKTOP_COLUMN_COUNT : orientation === Orientation.LANDSCAPE ? MOBILE_LANDSCAPE_COLUMN_COUNT : MOBILE_PORTRAIT_ROW_COUNT

  return (
    <Box style={{
      ...getGridStyle(tab, orientation),
      zIndex: 0,
    }}>
      {Array(cellCount).fill(0).map((_, i) => i + 1)
        .map(col => <button
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
        )}
    </Box>
  )
}
