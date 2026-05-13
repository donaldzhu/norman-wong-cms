/** Number of visible cells in each project slide range strip variant. */
export const DESKTOP_COLUMN_COUNT = 24
export const MOBILE_PORTRAIT_ROW_COUNT = 24
export const MOBILE_LANDSCAPE_COLUMN_COUNT = 12

/** Stored `start` is the left edge index (1–24); stored `end` is the right edge (2–25). */
export const EDGE_START_MIN = 1
export const EDGE_START_MAX = DESKTOP_COLUMN_COUNT
export const EDGE_END_MIN = 2
export const EDGE_END_MAX = DESKTOP_COLUMN_COUNT + 1

/** Whether a cell lies inside the half-open span [start, end). */
export function cellIsInSpan(cell: number, start: number, end: number): boolean {
  return cell >= start && cell < end
}

/**
 * From two clicked cells (1-based indices), returns stored edge span.
 * Highlighted cells are min…max inclusive; stored end is max+1.
 */
export function spanFromClickedCells(a: number, b: number): { start: number; end: number } {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return { start: lo, end: hi + 1 }
}

/** Single-column span when only one cell is chosen. */
export function spanFromSingleCell(cell: number): { start: number; end: number } {
  return { start: cell, end: cell + 1 }
}
