import { Box } from '@sanity/ui'
import { DESKTOP_COLUMN_COUNT } from '../../../utils/columnRange'
import { MediaInCell } from './mediaInCell'
import type { ProjectSlideGridValue } from '../../types/media'
import { isValidDesktopSpan } from './utils'

export const DesktopPreviewLayer = ({
  media,
  activeKey,
}: {
  media: ProjectSlideGridValue[]
  activeKey: string | null
}) => (
  <Box
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: `repeat(${DESKTOP_COLUMN_COUNT}, minmax(0, 1fr))`,
      gridTemplateRows: '1fr',
      pointerEvents: 'none',
      zIndex: 1,
    }}
  >
    {media.map((item, index) => {
      if (!item._key || !isValidDesktopSpan(item.desktopStart, item.desktopEnd)) return null
      const isActive = item._key === activeKey
      return (
        <Box
          key={item._key}
          style={{
            gridColumn: `${item.desktopStart} / ${item.desktopEnd}`,
            gridRow: '1',
            position: 'relative',
            zIndex: isActive ? 50 : 10 + index,
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: isActive ? '0 0 0 2px var(--card-focus-ring-color)' : undefined,
            boxSizing: 'border-box',
            background: 'var(--card-muted-bg-color)',
          }}
        >
          <MediaInCell item={item} />
        </Box>
      )
    })}
  </Box>
)
