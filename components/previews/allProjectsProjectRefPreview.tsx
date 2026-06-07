import type { MediaData } from '../types/media'
import { PreviewProps } from 'sanity'
import { PreviewTemplate } from './previewTemplate'
import { getMediaCountSubtitle } from '../../utils/preview'

type AllProjectsProjectRefPreviewProps = PreviewProps & {
  title?: string
  media: MediaData[]
}

export const AllProjectsProjectRefPreview = (props: PreviewProps) => {
  const {
    title,
    media,
  } = props as AllProjectsProjectRefPreviewProps

  return (
    <PreviewTemplate data={media?.[0]} title={title} subtitle={getMediaCountSubtitle(media)} />
  )
}
