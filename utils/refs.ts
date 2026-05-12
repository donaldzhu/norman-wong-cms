import type { AssetRef, MediaData, MediaRef, ValidAssetRef, ValidMediaRef } from '../components/types/media'

import { MediaType } from '../constants/enum'
import _ from 'lodash'

/** Image asset `_ref`s from slide media on any number of project documents (deduped). */
export const assetRefsFromAllProjectSlideDocs = (
  docs: Array<{ slides?: unknown } | null | undefined> | null | undefined,
): string[] => {
  const seen = new Set<string>()
  const out: string[] = []
  for (const doc of docs ?? []) {
    for (const ref of toRemove_assetRefsFromProject(doc?.slides)) {
      if (!seen.has(ref)) {
        seen.add(ref)
        out.push(ref)
      }
    }
  }
  return out
}

/** Mux video asset `_ref`s from slide media on any number of project documents (deduped). */
export const muxVideoAssetRefsFromAllProjectSlideDocs = (
  docs: Array<{ slides?: unknown } | null | undefined> | null | undefined,
): string[] => {
  const seen = new Set<string>()
  const out: string[] = []
  for (const doc of docs ?? []) {
    for (const ref of muxVideoAssetRefsFromProject(doc?.slides)) {
      if (!seen.has(ref)) {
        seen.add(ref)
        out.push(ref)
      }
    }
  }
  return out
}

// TODO: remove
export const toRemove_assetRefsFromProject = (slides: unknown): string[] => {
  const refs: string[] = []
  const seen = new Set<string>()
  if (!Array.isArray(slides)) return refs

  for (const slide of slides) {
    if (!slide || typeof slide !== 'object') continue
    const media = (slide as { media?: unknown }).media
    if (!Array.isArray(media)) continue

    for (const item of media) {
      if (!item || typeof item !== 'object') continue
      const row = item as {
        _type?: string
        mediaType?: string
        image?: { asset?: { _ref?: string } }
      }
      if (row._type !== 'projectSlideMedia' || row.mediaType !== MediaType.IMAGE) continue
      const ref = row.image?.asset?._ref
      if (!ref || seen.has(ref)) continue
      seen.add(ref)
      refs.push(ref)
    }
  }

  return refs
}

/** `mux.videoAsset` document ids referenced from slide `projectSlideMedia` rows with `type: 'video'`. */
export const muxVideoAssetRefsFromProject = (slides: unknown): string[] => {
  const refs: string[] = []
  const seen = new Set<string>()
  if (!Array.isArray(slides)) return refs

  for (const slide of slides) {
    if (!slide || typeof slide !== 'object') continue
    const media = (slide as { media?: unknown }).media
    if (!Array.isArray(media)) continue

    for (const item of media) {
      if (!item || typeof item !== 'object') continue
      const row = item as {
        _type?: string
        mediaType?: string
        video?: { asset?: { _ref?: string } }
      }
      if (row._type !== 'projectSlideMedia' || row.mediaType !== 'video') continue
      const ref = row.video?.asset?._ref
      if (!ref || seen.has(ref)) continue
      seen.add(ref)
      refs.push(ref)
    }
  }

  return refs
}

/** Resolve draft ↔ published id so GROQ can load slides when the reference points at either variant. */
export function projectDocumentIdsForQuery(projectRef: string): string[] {
  if (projectRef.startsWith('drafts.')) {
    const published = projectRef.replace(/^drafts\./, '')
    return published ? [projectRef, published] : [projectRef]
  }
  return [`drafts.${projectRef}`, projectRef]
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