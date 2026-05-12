import * as changeCase from 'change-case'

import type { MediaData } from '../types/media'
import { PreviewProps } from 'sanity'
import { PreviewTemplate } from './previewTemplate'
import type { Size } from '../../constants/enum'

type ProjectSlidePreviewProps = PreviewProps & MediaData & {
  desktopSize?: Size
  mobileSize?: Size
}

export const AllProjectSlidePreview = (props: PreviewProps) => {
  const {
    desktopSize,
    mobileSize,
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
    <PreviewTemplate data={data?.[0]} title={title} subtitle={subtitle} />
  )
}
