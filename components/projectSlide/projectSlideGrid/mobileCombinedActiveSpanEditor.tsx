import { Box, Button, Flex, Text } from '@sanity/ui'
import {
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from '../../../utils/columnRange'

import { LinearSpanInteractionOverlay } from './linearSpanInteractionOverlay'
import { MobileAllMediaPreviewLayer } from './mobileAllMediaPreviewLayer'
import { MobileZebraBackdrop } from './mobileZebraBackdrop'
import type { ProjectSlideGridValue } from '../../types/media'
import { mobilePreviewFrameStyle } from './mobilePreviewFrameStyle'

export const MobileCombinedActiveSpanEditor = ({
  media,
  activeItem,
  activeMediaKey,
  orientation,
  readOnly = false,
  onCommit,
  onClear,
}: {
  media: ProjectSlideGridValue[]
  activeItem: ProjectSlideGridValue
  activeMediaKey: string
  orientation: 'portrait' | 'landscape'
  readOnly?: boolean
  onCommit: (start: number, end: number) => void
  onClear: () => void
}) => {
  const isPortrait = orientation === 'portrait'
  const cellCount = isPortrait ? MOBILE_PORTRAIT_ROW_COUNT : MOBILE_LANDSCAPE_COLUMN_COUNT
  const direction = isPortrait ? 'vertical' : 'horizontal'
  const unitLabel = isPortrait ? 'Row' : 'Column'
  const start = activeItem.mobileStart
  const end = activeItem.mobileEnd
  const rangeLabel =
    start != null && end != null ? `${unitLabel}: ${start}–${end}` : `${unitLabel}: —`

  const stripOuter = mobilePreviewFrameStyle(isPortrait)

  return (
    <Box>
      <Flex align="center" justify="flex-end" gap={3} style={{ marginBottom: 8 }}>
        <Button text="Clear" mode="ghost" disabled={readOnly} onClick={() => onClear()} />
        <Text size={1} style={{ lineHeight: 1.2 }}>
          {rangeLabel}
        </Text>
      </Flex>

      <Box style={stripOuter}>
        <MobileZebraBackdrop direction={direction} cellCount={cellCount} />
        <MobileAllMediaPreviewLayer
          media={media}
          activeKey={activeMediaKey}
          orientation={orientation}
        />
        <LinearSpanInteractionOverlay
          key={`${activeMediaKey}-${orientation}`}
          direction={direction}
          cellCount={cellCount}
          start={start}
          end={end}
          readOnly={readOnly}
          onCommit={onCommit}
          ariaLabel={`Mobile span (${orientation}). Two-click span. Shift+click: one cell.`}
        />
      </Box>
    </Box>
  )
}
