import type { MediaData } from '../types/media'
import { PreviewProps } from 'sanity'
import { PreviewTemplate } from './previewTemplate'
import { getMediaCountSubtitle } from '../../utils/preview'

type ProjectSlidesPreviewProps = PreviewProps & {
  description?: string
  year?: number
  slideMedia?: MediaData[]
}

export const ProjectSlidesPreview = (props: PreviewProps) => {
  const {
    description,
    year,
    slideMedia
  } = props as ProjectSlidesPreviewProps

  const titleParts: string[] = []
  if (description) titleParts.push(description)
  if (year != null) titleParts.push(String(year))
  const title = titleParts.length ? titleParts.join(' · ') : 'Untitled'
  const subtitle = getMediaCountSubtitle(slideMedia ?? [])

  return (
    <PreviewTemplate data={slideMedia?.[0]} title={title} subtitle={subtitle} />
  )
}
