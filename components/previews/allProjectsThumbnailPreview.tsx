import * as changeCase from 'change-case'

import type { MediaData } from '../types/media'
import { PreviewProps } from 'sanity'
import { PreviewTemplate } from './previewTemplate'
import type { Size } from '../../constants/enum'
import { Badge, Card, Flex } from '@sanity/ui'

type ProjectSlidePreviewProps = PreviewProps & MediaData & {
  desktopSize?: Size
  mobileSize?: Size
  hideOnMobile?: boolean
}

export const AllProjectSlidePreview = (props: PreviewProps) => {
  const {
    desktopSize,
    mobileSize,
    hideOnMobile,
    mediaType,
    image,
    video,
  } = props as ProjectSlidePreviewProps

  const title = changeCase.capitalCase(mediaType ?? 'Unknown')

  const subtitleParts: string[] = []
  if (desktopSize) subtitleParts.push(`Desktop: ${changeCase.capitalCase(desktopSize)}`)
  if (mobileSize) subtitleParts.push(`Mobile: ${changeCase.capitalCase(mobileSize)}`)
  const subtitle = subtitleParts.length ? subtitleParts.join(' · ') : undefined

  const data = mediaType ? [{
    mediaType,
    image,
    video,
  }] : undefined

  return (
    <Card paddingRight={2}>
      <Flex align="center">
        <Flex flex={1} style={{ minWidth: 0 }}>
          <PreviewTemplate data={data?.[0]} title={title} subtitle={subtitle} />
        </Flex>
        {hideOnMobile && (
          <Badge tone="neutral" fontSize={1}>
            Hidden on Mobile
          </Badge>
        )}
      </Flex>
    </Card>
  )
}
