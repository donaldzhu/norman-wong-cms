import { Box, Card, Flex, Text, Tooltip } from '@sanity/ui'

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

const ERROR_ICON_SIZE = 25

export const ProjectSlideGridThumbnail = ({
  item,
  selected,
  hasError,
  onSelect,
}: ProjectSlideGridThumbnailProps) => {
  const isVideo = item.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? item.video : item.image
  const hasRef = Boolean(mediaWithRef?.asset?._ref)

  const borderColor = hasError ? 'var(--card-badge-critical-icon-color)' : selected ? 'var(--card-focus-ring-color)' : 'transparent'

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
        outline: selected ? `1px solid ${borderColor}` : undefined,
      }}
    >
      <Flex align="center" justify="space-between" gap={3}>
        <Flex align="center" justify="space-between">
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


          <Text size={1} weight={selected ? 'semibold' : 'regular'}>
            {isVideo ? 'Video' : 'Image'}
          </Text>
        </Flex>
        {hasError ? (
          <Tooltip
            placement='top'
            portal
            animate
            content={
              <Box padding={1}>
                <Text muted size={1}>
                  Grid setting is invalid or missing.
                </Text>
              </Box>
            }>
            <Box
              style={{
                color: 'var(--card-badge-critical-icon-color)',
                width: ERROR_ICON_SIZE,
                height: ERROR_ICON_SIZE,
              }}
            >
              <ErrorOutlineIcon width={ERROR_ICON_SIZE} height={ERROR_ICON_SIZE} />
            </Box>
          </Tooltip>
        ) : null}
      </Flex>
    </Card>
  )
}
