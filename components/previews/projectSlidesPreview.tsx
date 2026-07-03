import type { MediaData } from '../types/media'
import { MediaType } from '../../constants/enum'
import { PreviewProps } from 'sanity'
import { PreviewTemplate } from './previewTemplate'

type ProjectSlidesPreviewProps = PreviewProps & {

  media?: MediaData[]
}

export const ProjectSlidesPreview = (props: PreviewProps) => {
  const { media } = props as ProjectSlidesPreviewProps

  const titleParts: string[] = []
  let imageCount = media?.filter(m => m.mediaType === MediaType.IMAGE).length
  let videoCount = media?.filter(m => m.mediaType === MediaType.VIDEO).length

  if (imageCount) titleParts.push(`${imageCount} ${imageCount === 1 ? 'image' : 'images'}`)
  if (videoCount) titleParts.push(`${videoCount} ${videoCount === 1 ? 'video' : 'videos'}`)

  const title = titleParts.length ? titleParts.join(' · ') : 'Untitled'

  return (
    <PreviewTemplate data={media?.[0]} title={title} />
  )
}
