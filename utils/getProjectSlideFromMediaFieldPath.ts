import type {Path} from '@sanity/types'

export type ProjectSlidePathParent = {
  _key?: string
  automaticMobileLayout?: boolean
  mobileOrientation?: unknown
  media?: unknown
}

/** Resolve the parent `projectSlide` for a field whose path includes `slides`, slide key, `media`, … */
export function getProjectSlideFromMediaFieldPath(
  document: Record<string, unknown> | null | undefined,
  path: Path | undefined,
): ProjectSlidePathParent | undefined {
  if (!document || !path || !Array.isArray(path)) return undefined

  const mediaIdx = path.indexOf('media')
  if (mediaIdx < 1) return undefined

  const slideSegment = path[mediaIdx - 1]
  const slideKey =
    slideSegment && typeof slideSegment === 'object' && '_key' in slideSegment
      ? (slideSegment as {_key: string})._key
      : undefined
  if (!slideKey) return undefined

  const slides = document.slides
  if (!Array.isArray(slides)) return undefined

  for (const slide of slides) {
    if (slide && typeof slide === 'object' && (slide as {_key?: string})._key === slideKey) {
      return slide as ProjectSlidePathParent
    }
  }

  return undefined
}
