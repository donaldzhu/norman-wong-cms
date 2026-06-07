import { Box } from '@sanity/ui'
import { DeviceType } from '../types/gridLayout'
import { MediaRefPreview } from '../previews/mediaRefPreview'
import { MediaType } from '../../constants/enum'
import { Orientation } from '../../constants/enum'
import type { ProjectSlideGridValue } from '../types/media'

interface ProjectSlideGridMediaProps {
  item: ProjectSlideGridValue
  tab: DeviceType
  orientation: Orientation
}

export const ProjectSlideGridMedia = ({ item, tab, orientation }: ProjectSlideGridMediaProps) => {
  const isVideo = item.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? item.video : item.image
  if (!mediaWithRef?.asset?._ref) return null

  const isMobilePortrait = tab === DeviceType.MOBILE && orientation === Orientation.PORTRAIT
  return (
    <Box
      display="flex"
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MediaRefPreview
        mediaType={isVideo ? MediaType.VIDEO : MediaType.IMAGE}
        mediaWithRef={mediaWithRef}
        sanityImageWidth={800}
        showSpinner={isVideo}
        style={{
          width: isMobilePortrait ? 'auto' : '100%',
          height: isMobilePortrait ? '100%' : 'auto',
          display: 'block',
        }}
      />
    </Box>
  )
}
