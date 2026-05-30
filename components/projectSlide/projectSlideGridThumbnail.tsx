import { Box, Card, Flex, Text, Tooltip } from '@sanity/ui'

import { ErrorIcon } from '../common/errorIcon'
import { MediaRefPreview } from '../previews/mediaRefPreview'
import { MediaType } from '../../constants/enum'
import type { ProjectSlideGridValue } from '../types/media'

interface ProjectSlideGridThumbnailProps {
  item: ProjectSlideGridValue
  selected: boolean
  error: string | undefined
  onSelect: () => void
}

export const ProjectSlideGridThumbnail = ({
  item,
  selected,
  error,
  onSelect,
}: ProjectSlideGridThumbnailProps) => {
  const isVideo = item.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? item.video : item.image
  const hasRef = !!mediaWithRef?.asset?._ref

  const borderColor = error ? 'var(--card-badge-critical-icon-color)' : selected ? 'var(--card-focus-ring-color)' : 'transparent'

  return (
    <Card
      as="button"
      type="button"
      padding={2}
      radius={2}
      tone={error ? 'critical' : selected ? 'primary' : 'transparent'}
      border
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        outline: selected ? `1px solid ${borderColor}` : undefined,
      }}
    >
      <Flex align="center" justify="space-between" gap={3}>
        <Flex align="center" gap={2}>
          <Box
            style={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: 4,
              overflow: 'hidden',
              background: 'var(--card-muted-bg-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hasRef && (
              <MediaRefPreview
                mediaType={isVideo ? MediaType.VIDEO : MediaType.IMAGE}
                mediaWithRef={mediaWithRef}
                showSpinner={isVideo}
                style={{ objectFit: 'cover' }}
              />
            )}
          </Box>
          <Text size={1} weight={selected ? 'semibold' : 'regular'}>
            {isVideo ? 'Video' : 'Image'}
          </Text>
        </Flex>
        {error && (
          <Tooltip
            placement='top'
            portal
            animate
            content={
              <Box padding={1}>
                <Text muted size={1}>
                  {error}
                </Text>
              </Box>
            }>
            <ErrorIcon />

          </Tooltip>
        )}
      </Flex>
    </Card>
  )
}
