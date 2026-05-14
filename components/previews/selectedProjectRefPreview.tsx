import type { MediaData } from '../types/media'
import { PreviewProps } from 'sanity'
import { PreviewTemplate } from './previewTemplate'
import { getMediaCountSubtitle } from '../../utils/preview'

type SelectedProjectRefPreviewProps = PreviewProps & {
  title?: string
  media: MediaData[]
}

export const SelectedProjectRefPreview = (props: PreviewProps) => {
  const {
    title,
    media,
  } = props as SelectedProjectRefPreviewProps

  return (
    <PreviewTemplate data={media?.[0]} title={title} subtitle={getMediaCountSubtitle(media)} />
  )
}
