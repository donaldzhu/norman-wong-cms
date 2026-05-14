import type { MediaData } from '../components/types/media'
import { MediaType } from '../constants/enum'

export const getMediaCountSubtitle = (rows?: MediaData[] | unknown) => {
  const counter = []
  const NO_MEDIA_MESSAGE = 'No media'

  if (!rows || !Array.isArray(rows)) return NO_MEDIA_MESSAGE
  const imageCounter = rows.filter(r => r.mediaType === MediaType.IMAGE).length
  const videoCounter = rows.filter(r => r.mediaType === MediaType.VIDEO).length
  if (imageCounter) counter.push(`${imageCounter} images`)
  if (videoCounter) counter.push(`${videoCounter} videos`)
  return counter.length ? counter.join(' · ') : NO_MEDIA_MESSAGE
}