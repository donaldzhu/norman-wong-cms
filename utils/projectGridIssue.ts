import { Orientation } from '../constants/enum'
import {
  DESKTOP_COLUMN_COUNT,
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from './columnRange'

export const getMobileCellCountForProjectOrientation = (mobileOrientation?: string): number =>
  mobileOrientation === Orientation.LANDSCAPE
    ? MOBILE_LANDSCAPE_COLUMN_COUNT
    : MOBILE_PORTRAIT_ROW_COUNT

export const isValidDesktopSpanForIssue = (start: unknown, end: unknown): boolean =>
  typeof start === 'number' &&
  typeof end === 'number' &&
  start >= 1 &&
  start <= DESKTOP_COLUMN_COUNT &&
  end >= 2 &&
  end <= DESKTOP_COLUMN_COUNT + 1 &&
  end > start

export const isValidMobileSpanForIssue = (
  start: unknown,
  end: unknown,
  cellCount: number,
): boolean => {
  const maxEdge = cellCount + 1
  return (
    typeof start === 'number' &&
    typeof end === 'number' &&
    start >= 1 &&
    start <= cellCount &&
    end >= 2 &&
    end <= maxEdge &&
    end > start
  )
}

type SlideMediaLike = {
  desktopStart?: unknown
  desktopEnd?: unknown
  mobileStart?: unknown
  mobileEnd?: unknown
}

type SlideLike = {
  media?: unknown
  automaticMobileLayout?: boolean
  mobileOrientation?: string
}

/** True if any slide media is missing or has invalid desktop or (when that slide uses custom mobile) mobile spans. */
export const hasProjectGridConfigurationIssue = (slides: unknown): boolean => {
  if (!Array.isArray(slides) || slides.length === 0) return false

  for (const slide of slides) {
    const s = slide as SlideLike
    const autoMobile = s.automaticMobileLayout !== false
    const cellCount = getMobileCellCountForProjectOrientation(s.mobileOrientation)

    const media = s.media
    if (!Array.isArray(media)) continue

    for (const item of media) {
      const m = item as SlideMediaLike
      if (!isValidDesktopSpanForIssue(m.desktopStart, m.desktopEnd)) return true
      if (!autoMobile && !isValidMobileSpanForIssue(m.mobileStart, m.mobileEnd, cellCount))
        return true
    }
  }

  return false
}
