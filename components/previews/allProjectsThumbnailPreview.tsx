import { PreviewProps } from 'sanity'
import { type MediaData } from './mediaRefPreview'
import * as changeCase from 'change-case'
import { PreviewTemplate } from './previewTemplate'

type ProjectSlidePreviewProps = PreviewProps & {
  desktopSize?: string
  mobileSize?: string
  mediaType: MediaData['mediaType']
  image?: MediaData['image']
  video?: MediaData['video']
}

export const ProjectSlidePreview = (props: PreviewProps) => {
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
    <PreviewTemplate data={data} title={title} subtitle={subtitle} />
  )
}
