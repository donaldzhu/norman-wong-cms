import { DESKTOP_COLUMN_COUNT } from '../../../utils/columnRange'

export const mediaKeyPath = (key: string, field: string): [string, { _key: string }, string] => [
  'media',
  { _key: key },
  field,
]

export const isValidDesktopSpan = (start: number | undefined, end: number | undefined) =>
  typeof start === 'number' &&
  typeof end === 'number' &&
  start >= 1 &&
  start <= DESKTOP_COLUMN_COUNT &&
  end >= 2 &&
  end <= DESKTOP_COLUMN_COUNT + 1 &&
  end > start

export const isValidMobileSpan = (
  start: number | undefined,
  end: number | undefined,
  cellCount: number,
) => {
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

/** Equal row/column slices for read-only “automatic” preview (not persisted). */
export const equalSplitMobileSpans = (
  itemCount: number,
  cellCount: number,
): { start: number; end: number }[] => {
  if (itemCount <= 0 || cellCount <= 0) return []
  const base = Math.floor(cellCount / itemCount)
  let remainder = cellCount % itemCount
  const spans: { start: number; end: number }[] = []
  let start = 1
  for (let i = 0; i < itemCount; i++) {
    const len = base + (remainder > 0 ? 1 : 0)
    if (remainder > 0) remainder -= 1
    const end = start + len
    spans.push({ start, end })
    start = end
  }
  return spans
}
