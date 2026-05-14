import { Box, Flex, Text } from '@sanity/ui'

import { MediaRefPreview } from '../../previews/mediaRefPreview'
import { MediaType } from '../../../constants/enum'
import type { ProjectSlideGridValue } from '../../types/media'

export const MediaInCell = ({ item }: { item: ProjectSlideGridValue }) => {
  const isVideo = item.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? item.video : item.image
  const hasRef = Boolean(mediaWithRef?.asset?._ref)
  if (!hasRef) {
    return (
      <Flex align="center" justify="center" height="fill">
        <Text muted size={0}>
          —
        </Text>
      </Flex>
    )
  }
  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MediaRefPreview
        mediaType={isVideo ? MediaType.VIDEO : MediaType.IMAGE}
        mediaWithRef={mediaWithRef}
        sanityImageWidth={400}
        showSpinner={isVideo}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  )
}
