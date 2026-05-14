import type { AssetRef, MediaData, MediaRef, ValidAssetRef, ValidMediaRef } from '../components/types/media'

import { MediaType } from '../constants/enum'
import _ from 'lodash'

export const prepareProjectId = (projectRef: string) => {
  if (!projectRef.startsWith('drafts.'))
    return [`drafts.${projectRef}`, projectRef]

  const published = projectRef.replace(/^drafts\./, '')
  return published ? [projectRef, published] : [projectRef]
}

export const isValidAssetRef = (ref?: AssetRef): ref is ValidAssetRef => !!ref?.asset?._ref
export const isValidMediaRef = (ref?: MediaRef): ref is ValidMediaRef => !!ref?.mediaType && !!ref?.media?.asset?._ref

export const mediaDataToMediaRef = (data?: MediaData): MediaRef | undefined => {
  const { mediaType, image, video } = data ?? {}
  return { mediaType, media: mediaType === MediaType.IMAGE ? image : video }
}

export const mediaRefsFromProject = (slides: unknown): ValidMediaRef[] => {
  const refs: (MediaRef | undefined)[] = []

  if (!Array.isArray(slides)) return []
  for (const slide of slides) {
    const media = (slide as { media?: unknown }).media
    if (!Array.isArray(media)) continue
    for (const item of media)
      refs.push(mediaDataToMediaRef(item as MediaData))
  }

  return _.uniq(refs.filter(isValidMediaRef))
}