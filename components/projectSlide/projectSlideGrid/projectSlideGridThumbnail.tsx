import { Box, Card, Flex, Text } from '@sanity/ui'

import { ErrorOutlineIcon } from '@sanity/icons'
import { MediaRefPreview } from '../../previews/mediaRefPreview'
import { MediaType } from '../../../constants/enum'
import type { ProjectSlideGridValue } from '../../types/media'

interface ProjectSlideGridThumbnailProps {
  item: ProjectSlideGridValue
  selected: boolean
  hasError: boolean
  onSelect: () => void
}

export const ProjectSlideGridThumbnail = ({
  item,
  selected,
  hasError,
  onSelect,
}: ProjectSlideGridThumbnailProps) => {
  const isVideo = item.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? item.video : item.image
  const hasRef = Boolean(mediaWithRef?.asset?._ref)

  return (
    <Card
      as="button"
      type="button"
      padding={2}
      radius={2}
      tone={hasError ? 'critical' : selected ? 'primary' : 'transparent'}
      border
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        outline: selected ? '2px solid var(--card-focus-ring-color)' : undefined,
      }}
    >
      <Flex align="center" gap={3}>
        <Box flex="none" style={{ position: 'relative', width: 56, height: 56 }}>
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
            {hasRef ? (
              <MediaRefPreview
                mediaType={isVideo ? MediaType.VIDEO : MediaType.IMAGE}
                mediaWithRef={mediaWithRef}
                sanityImageWidth={200}
                showSpinner={isVideo}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <Flex align="center" justify="center" height="fill" padding={2}>
                <Text muted size={0}>
                  {isVideo ? 'Video' : '—'}
                </Text>
              </Flex>
            )}
          </Box>
          {hasError ? (
            <Box
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                color: 'var(--card-badge-critical-icon-color)',
                lineHeight: 0,
                pointerEvents: 'none',
              }}
            >
              <ErrorOutlineIcon />
            </Box>
          ) : null}
        </Box>
        <Text size={1} weight={selected ? 'semibold' : 'regular'}>
          {isVideo ? 'Video' : 'Image'}
        </Text>
      </Flex>
    </Card>
  )
}
