import { Box, Text } from '@sanity/ui'
import { DESKTOP_COLUMN_COUNT, MOBILE_LANDSCAPE_COLUMN_COUNT, MOBILE_PORTRAIT_ROW_COUNT } from './configs'
import { DeviceType, GridSpan } from '../types/gridLayout'
import {
  getSpanFromCells,
  getSpanFromSingleCell
} from '../../utils/projectSlide'

import { Orientation } from '../../constants/enum'
import { getGridStyle } from '../../utils/projectSlide'
import { useState } from 'react'

interface ProjectSlideGridInteractionProps {
  orientation?: Orientation
  tab: DeviceType
  onCommit: (span: GridSpan) => void
}

export const ProjectSlideGridInteraction = ({
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

  const getColumnLabel = (col: number) => {
    const columnCount = tab === DeviceType.DESKTOP ? DESKTOP_COLUMN_COUNT : MOBILE_LANDSCAPE_COLUMN_COUNT
    const halfColumnCount = columnCount / 2
    if (col <= halfColumnCount) {
      return `-${halfColumnCount - col + 1}`
    }
    return `+${col - halfColumnCount}`
  }
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
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
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
          <Box padding={2}>
            <Text size={1} muted style={{ fontSize: '0.75rem' }}>{getColumnLabel(col)}</Text>
          </Box>
        </button>
        )}
    </Box>
  )
}
