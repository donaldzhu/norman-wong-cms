import { Box, Text } from '@sanity/ui'
import {
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from '../../../utils/columnRange'

import { MobileAllMediaPreviewLayer } from './mobileAllMediaPreviewLayer'
import { MobileZebraBackdrop } from './mobileZebraBackdrop'
import type { ProjectSlideGridValue } from '../../types/media'
import { equalSplitMobileSpans } from './utils'
import { mobilePreviewFrameStyle } from './mobilePreviewFrameStyle'
import { useMemo } from 'react'

/** Read-only mobile frame when automatic layout is on (equal split, not saved). */
export const MobileAutomaticReadOnlyPreview = ({
  media,
  activeKey,
  orientation,
}: {
  media: ProjectSlideGridValue[]
  activeKey: string | null
  orientation: 'portrait' | 'landscape'
}) => {
  const isPortrait = orientation === 'portrait'
  const cellCount = isPortrait ? MOBILE_PORTRAIT_ROW_COUNT : MOBILE_LANDSCAPE_COLUMN_COUNT
  const direction = isPortrait ? 'vertical' : 'horizontal'

  const placements = useMemo(() => {
    const items = media.filter(m => m._key)
    const spans = equalSplitMobileSpans(items.length, cellCount)
    return items.map((item, i) => ({
      item,
      start: spans[i]?.start ?? 1,
      end: spans[i]?.end ?? cellCount + 1,
    }))
  }, [media, cellCount])

  if (placements.length === 0) {
    return (
      <Box padding={4}>
        <Text size={1}>Add media to preview mobile layout.</Text>
      </Box>
    )
  }

  return (
    <Box style={mobilePreviewFrameStyle(isPortrait)}>
      <MobileZebraBackdrop direction={direction} cellCount={cellCount} />
      <MobileAllMediaPreviewLayer
        placements={placements}
        activeKey={activeKey}
        orientation={orientation}
      />
    </Box>
  )
}
