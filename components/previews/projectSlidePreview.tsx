import * as changeCase from 'change-case'

import type { AssetRef, MediaData } from '../types/media'

import { MediaType } from '../../constants/enum'
import { PreviewProps } from 'sanity'
import { PreviewTemplate } from './previewTemplate'

type ProjectSlidePreviewProps = PreviewProps & {
  title?: string
  mediaType?: MediaType
  image?: AssetRef
  video?: AssetRef
  desktopStart?: number
  desktopEnd?: number
}

export const ProjectSlidePreview = (props: PreviewProps) => {
  const {
    mediaType,
    image,
    video,
    desktopStart,
    desktopEnd,
  } = props as ProjectSlidePreviewProps

  const title = mediaType ? changeCase.capitalCase(mediaType) : 'Unknown'
  const mediaData: MediaData = {
    mediaType: mediaType ?? MediaType.IMAGE,
    image,
    video,
  }

  const subtitle = desktopStart && desktopEnd ? `Column ${desktopStart} - ${desktopEnd}` : undefined

  return (
    <PreviewTemplate data={mediaData} title={title} subtitle={subtitle} />
  )
}
