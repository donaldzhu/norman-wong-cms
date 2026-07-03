import { Box } from '@sanity/ui'
import { DeviceType } from '../types/gridLayout'
import { MediaRefPreview } from '../previews/mediaRefPreview'
import { MediaType, Orientation } from '../../constants/enum'
import type { ProjectSlideGridValue } from '../types/media'
import { getProjectSlideMediaForDevice } from '../../utils/projectSlide'

interface ProjectSlideGridMediaProps {
  item: ProjectSlideGridValue
  tab: DeviceType
  orientation: Orientation
}

export const ProjectSlideGridMedia = ({ item, tab, orientation }: ProjectSlideGridMediaProps) => {
  const resolved = getProjectSlideMediaForDevice(item, tab)
  if (!resolved?.mediaWithRef?.asset?._ref) return null

  const { mediaType, mediaWithRef } = resolved
  const isVideo = mediaType === MediaType.VIDEO

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
        mediaType={mediaType}
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
