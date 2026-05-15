import { Box } from '@sanity/ui'
import { MediaRefPreview } from '../../previews/mediaRefPreview'
import { MediaType } from '../../../constants/enum'
import type { ProjectSlideGridValue } from '../../types/media'

export const ProjectSlideGridMedia = ({ item }: { item: ProjectSlideGridValue }) => {
  const isVideo = item.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? item.video : item.image
  if (!mediaWithRef?.asset?._ref) return null

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
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </Box>
  )
}
