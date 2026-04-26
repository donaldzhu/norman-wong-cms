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
        mediaType?: string
        image?: { asset?: { _ref?: string } }
      }
      if (row.mediaType !== 'image') continue
      const ref = row.image?.asset?._ref
      if (!ref || seen.has(ref)) continue
      seen.add(ref)
      refs.push(ref)
    }
  }

  return refs
}
