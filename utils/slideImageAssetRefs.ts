export function slideImageAssetRefsFromSlides(slides: unknown): string[] {
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
