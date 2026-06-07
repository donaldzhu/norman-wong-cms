import * as changeCase from 'change-case'

import { HideableOnMobile } from './hideableOnMobile'
import type { MediaData } from '../types/media'
import { PreviewProps } from 'sanity'
import type { Size } from '../../constants/enum'

type SelectedWorksThumbnailPreviewProps = PreviewProps & MediaData & {
  desktopSize?: Size
  mobileSize?: Size
  hideOnMobile?: boolean
}

export const SelectedWorksThumbnailPreview = (props: PreviewProps) => {
  const {
    desktopSize,
    mobileSize,
    hideOnMobile,
    mediaType,
    image,
    video,
  } = props as SelectedWorksThumbnailPreviewProps

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
    <HideableOnMobile
      data={data?.[0]}
      title={title}
      subtitle={subtitle}
      hideOnMobile={hideOnMobile} />
  )
}
