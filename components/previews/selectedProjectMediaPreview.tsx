import type { AssetRef, MediaData } from '../types/media'
import { PreviewProps } from 'sanity'
import { PreviewTemplate } from './previewTemplate'
import type { MediaType } from '../../constants/enum'

type SelectedProjectMediaPreviewProps = PreviewProps & {
  mediaType: MediaType
  image?: AssetRef
  video?: AssetRef
}

export const SelectedProjectMediaPreview = (props: PreviewProps) => {
  const {
    mediaType,
    image,
    video,
  } = props as SelectedProjectMediaPreviewProps

  const mediaData: MediaData = {
    mediaType,
    image,
    video,
  }

  return (
    <PreviewTemplate data={mediaData} title={mediaType} />
  )
}
