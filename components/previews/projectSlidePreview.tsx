import { PreviewProps } from 'sanity'
import { type MediaData } from './mediaRefPreview'
import { PreviewTemplate } from './previewTemplate'

type ProjectSlidePreviewProps = PreviewProps & {
  description?: string
  year?: number
  slideMedia?: MediaData[]
}

const countMedia = (rows: MediaData[]) => {
  const counter = []
  const imageCounter = rows.filter(r => r.mediaType === 'image').length
  const videoCounter = rows.filter(r => r.mediaType === 'video').length
  if (imageCounter) counter.push(`${imageCounter} images`)
  if (videoCounter) counter.push(`${videoCounter} videos`)
  return counter.length ? counter.join(' · ') : 'No media'
}


export const ProjectSlidePreview = (props: PreviewProps) => {
  const {
    description,
    year,
    slideMedia
  } = props as ProjectSlidePreviewProps

  const titleParts: string[] = []
  if (description) titleParts.push(description)
  if (year != null) titleParts.push(String(year))
  const title = titleParts.length ? titleParts.join(' · ') : 'Untitled'
  const subtitle = countMedia(slideMedia ?? [])

  return (
    <PreviewTemplate data={slideMedia} title={title} subtitle={subtitle} />
  )
}
