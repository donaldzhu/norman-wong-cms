export const assetRefsFromProject = (slides: unknown): string[] => {
  const refs: string[] = []
  const seen = new Set<string>()
  if (!Array.isArray(slides)) return refs

  for (const slide of slides) {
    if (!slide || typeof slide !== 'object') continue
    const media = (slide as { media?: unknown }).media
    if (!Array.isArray(media)) continue

    for (const item of media) {
      if (!item || typeof item !== 'object') continue
      const row: {
        _type?: string
        mediaType?: string
        image?: { asset?: { _ref?: string } }
      } = item
      const isSlideImage =
        row._type === 'imageObject' ||
        row._type === 'projectSlideMediaImage' ||
        (row._type === 'projectMediaItem' && row.mediaType === 'image')
      if (!isSlideImage) continue
      const ref = row.image?.asset?._ref
      if (!ref || seen.has(ref)) continue
      seen.add(ref)
      refs.push(ref)
    }
  }

  return refs
}

/** `mux.videoAsset` document ids referenced from slide media (`videoObject`, etc.). */
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
      const row: {
        _type?: string
        mediaType?: string
        video?: { asset?: { _ref?: string } }
      } = item
      const isSlideVideo =
        row._type === 'videoObject' ||
        (row._type === 'projectMediaItem' && row.mediaType === 'video')
      if (!isSlideVideo) continue
      const ref = row.video?.asset?._ref
      if (!ref || seen.has(ref)) continue
      seen.add(ref)
      refs.push(ref)
    }
  }

  return refs
}
