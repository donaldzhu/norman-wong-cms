import { Box } from '@sanity/ui'
import { GRID_STYLE } from './configs'
import { ProjectSlideGridMedia } from './projectSlideGridMedia'
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
      ...GRID_STYLE,
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
            zIndex: isActive ? 999 : 10 + index,
            overflow: 'hidden',
            boxShadow: isActive ? '0 0 0 1px var(--card-focus-ring-color)' : undefined,
            boxSizing: 'border-box',
          }}
        >
          <ProjectSlideGridMedia item={item} />
        </Box>
      )
    })}
  </Box>
)
