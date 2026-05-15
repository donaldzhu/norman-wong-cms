import { Box } from '@sanity/ui'
import { useMemo, type CSSProperties } from 'react'

import {
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from './configs'
import type { ProjectSlideGridValue } from '../../types/media'
import { ProjectSlideGridMedia } from './projectSlideGridMedia'
import type { MobilePlacement } from './types'
import { isValidMobileSpan } from './utils'

export const MobileAllMediaPreviewLayer = ({
  activeKey,
  orientation,
  placements,
  media,
}: {
  activeKey: string | null
  orientation: 'portrait' | 'landscape'
  placements?: MobilePlacement[]
  media?: ProjectSlideGridValue[]
}) => {
  const isPortrait = orientation === 'portrait'
  const cellCount = isPortrait ? MOBILE_PORTRAIT_ROW_COUNT : MOBILE_LANDSCAPE_COLUMN_COUNT
  const direction = isPortrait ? 'vertical' : 'horizontal'

  const rows = useMemo(() => {
    if (placements && placements.length > 0) return placements
    const list = media ?? []
    return list.flatMap(item => {
      if (!item._key || !isValidMobileSpan(item.mobileStart, item.mobileEnd, cellCount)) return []
      return [
        {
          item,
          start: item.mobileStart as number,
          end: item.mobileEnd as number,
        },
      ]
    })
  }, [placements, media, cellCount])

  const gridStyle: CSSProperties =
    direction === 'horizontal'
      ? {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${cellCount}, minmax(0, 1fr))`,
        gridTemplateRows: '1fr',
        gap: 1,
        pointerEvents: 'none',
        zIndex: 20,
      }
      : {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: `repeat(${cellCount}, minmax(0, 1fr))`,
        gap: 1,
        pointerEvents: 'none',
        zIndex: 20,
      }

  const placementFor = (start: number | undefined, end: number | undefined) =>
    direction === 'horizontal'
      ? { gridColumn: `${start} / ${end}` as const, gridRow: '1' as const }
      : { gridColumn: '1' as const, gridRow: `${start} / ${end}` as const }

  return (
    <Box style={gridStyle}>
      {rows.map((row, index) => {
        const { item, start, end } = row
        if (!item._key) return null
        const isActive = item._key === activeKey
        return (
          <Box
            key={item._key}
            style={{
              ...placementFor(start, end),
              position: 'relative',
              zIndex: isActive ? 50 : 10 + index,
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: isActive ? '0 0 0 2px var(--card-focus-ring-color)' : undefined,
              boxSizing: 'border-box',
              background: 'var(--card-muted-bg-color)',
            }}
          >
            <ProjectSlideGridMedia item={item} />
          </Box>
        )
      })}
    </Box>
  )
}
