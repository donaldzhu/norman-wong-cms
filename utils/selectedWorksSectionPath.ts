/** One segment in a Studio form path (string field name or array item key object). */
export type FormPathSegment = string | {_key: string}

/**
 * Returns the form path to the parent `selectedWorksSection` (… `sections` → `{_key}` …)
 * when editing a field under that section’s `thumbnails` array (e.g. image validation).
 */
export function selectedWorksSectionPathFromFieldPath(
  path: readonly FormPathSegment[],
): FormPathSegment[] | null {
  for (let i = 0; i < path.length; i++) {
    if (path[i] === 'thumbnails' && i >= 2) {
      return [...path.slice(0, i)]
    }
  }
  return null
}

export function getValueAtFormPath(root: unknown, path: readonly FormPathSegment[]): unknown {
  let cur: unknown = root
  for (const seg of path) {
    if (cur == null || typeof cur !== 'object') return undefined
    if (typeof seg === 'string') {
      cur = (cur as Record<string, unknown>)[seg]
      continue
    }
    const key = seg._key
    if (!Array.isArray(cur)) return undefined
    const row = (cur as unknown[]).find(
      item =>
        item &&
        typeof item === 'object' &&
        '_key' in item &&
        (item as {_key?: string})._key === key,
    )
    cur = row
  }
  return cur
}

export function publishedAndDraftIdsFromRef(ref: string): string[] {
  const id = ref.replace(/^drafts\./, '')
  const draft = `drafts.${id}`
  return ref.startsWith('drafts.') ? [ref, id] : [id, draft]
}
