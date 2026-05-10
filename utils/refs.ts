/** Image asset `_ref`s from slide media on any number of project documents (deduped). */
export const assetRefsFromAllProjectSlideDocs = (
  docs: Array<{ slides?: unknown } | null | undefined> | null | undefined,
): string[] => {
  const seen = new Set<string>()
  const out: string[] = []
  for (const doc of docs ?? []) {
    for (const ref of assetRefsFromProject(doc?.slides)) {
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
      const row = item as {
        _type?: string
        type?: string
        image?: { asset?: { _ref?: string } }
      }
      if (row._type !== 'projectSlideMedia' || row.type !== 'image') continue
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
        type?: string
        video?: { asset?: { _ref?: string } }
      }
      if (row._type !== 'projectSlideMedia' || row.type !== 'video') continue
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
