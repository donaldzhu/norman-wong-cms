import { Box, Flex, Stack, Text } from '@sanity/ui'

import { DocumentIcon } from '@sanity/icons'
import type { MediaData } from '../types/media'
import { MediaRefPreview } from './mediaRefPreview'
import { mediaDataToMediaRef } from '../../utils/refs'

interface PreviewTemplateProps {
  data?: MediaData
  title?: string
  subtitle?: string
}

const THUMBNAIL_SIZE = 33

export const PreviewTemplate = ({
  data,
  title,
  subtitle,
}: PreviewTemplateProps) => {
  const mediaData = mediaDataToMediaRef(data)

  return (
    <Flex align="center" gap={2} paddingY={2}>
      <Box
        flex="none"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: THUMBNAIL_SIZE,
          height: THUMBNAIL_SIZE,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'var(--card-muted-bg-color)',
        }}
      >
        {mediaData ?
          <MediaRefPreview
            mediaWithRef={mediaData?.media}
            mediaType={mediaData?.mediaType}
            style={{ objectFit: 'cover' }} /> :
          <DocumentIcon style={{ width: THUMBNAIL_SIZE, height: 21 }} />
        }
      </Box>
      <Stack gap={2} flex={1} style={{ minWidth: 0 }} >
        <Text size={1} textOverflow="ellipsis">
          {title}
        </Text>
        {subtitle && (
          <Text size={1} muted textOverflow="ellipsis">
            {subtitle}
          </Text>
        )}
      </Stack>
    </Flex>
  )
}