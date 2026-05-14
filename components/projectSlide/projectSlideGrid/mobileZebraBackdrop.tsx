import { Box } from '@sanity/ui'
import type { CSSProperties } from 'react'

export const MobileZebraBackdrop = ({
  direction,
  cellCount,
}: {
  direction: 'horizontal' | 'vertical'
  cellCount: number
}) => {
  const cells = Array.from({ length: cellCount }, (_, i) => i + 1)
  const gridStyle: CSSProperties =
    direction === 'horizontal'
      ? {
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${cellCount}, minmax(0, 1fr))`,
          gridTemplateRows: '1fr',
          gap: 1,
          zIndex: 1,
          pointerEvents: 'none',
        }
      : {
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridTemplateRows: `repeat(${cellCount}, minmax(0, 1fr))`,
          gap: 1,
          zIndex: 1,
          pointerEvents: 'none',
        }

  return (
    <Box style={gridStyle}>
      {cells.map(cell => (
        <Box
          key={cell}
          style={{
            borderRadius: 2,
            background: cell % 2 === 0 ? 'rgba(127,127,127,0.12)' : 'rgba(127,127,127,0.06)',
          }}
        />
      ))}
    </Box>
  )
}
