import { Box } from '@sanity/ui'
import { DeviceType } from '../types/gridLayout'
import { Orientation } from '../../constants/enum'
import { ProjectSlideGridMedia } from './projectSlideGridMedia'
import type { ProjectSlideGridValue } from '../types/media'
import { getGridStyle } from '../../utils/projectSlide'

interface ProjectSlideGridPreviewProps {
  media: ProjectSlideGridValue[]
  activeKey: string | null
  tab: DeviceType
  orientation?: Orientation
}

export const ProjectSlideGridPreview = ({
  media,
  activeKey,
  tab,
  orientation = Orientation.LANDSCAPE,
}: ProjectSlideGridPreviewProps) => {

  const isMobile = tab === DeviceType.MOBILE
  const isPortrait = orientation === Orientation.PORTRAIT

  return (
    <Box
      style={{
        ...getGridStyle(tab, orientation),
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {media.map((item, index) => {
        const isActive = item._key === activeKey
        const start = isMobile ? item.mobileStart : item.desktopStart
        const end = isMobile ? item.mobileEnd : item.desktopEnd
        const cellPosition = `${start} / ${end}`

        const gridColumn = !isMobile || !isPortrait ? cellPosition : '1'
        const gridRow = !isMobile || !isPortrait ? '1' : cellPosition

        if (!start || !end) return null
        return (
          <Box
            key={item._key}
            style={{
              gridColumn,
              gridRow,
              position: 'relative',
              zIndex: isActive ? 999 : 900 + index,
              overflow: 'hidden',
              boxShadow: isActive ? '0 0 0 1px var(--card-focus-ring-color)' : undefined,
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          >
            <ProjectSlideGridMedia item={item} tab={tab} orientation={orientation} />
          </Box>
        )
      })}
    </Box>
  )
}
