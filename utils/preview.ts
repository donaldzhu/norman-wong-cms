import type { MediaData } from '../components/types/media'
import { MediaType } from '../constants/enum'

export const getMediaCountSubtitle = (rows: MediaData[]) => {
  const counter = []
  const imageCounter = rows.filter(r => r.mediaType === MediaType.IMAGE).length
  const videoCounter = rows.filter(r => r.mediaType === MediaType.VIDEO).length
  if (imageCounter) counter.push(`${imageCounter} images`)
  if (videoCounter) counter.push(`${videoCounter} videos`)
  return counter.length ? counter.join(' · ') : 'No media'
}