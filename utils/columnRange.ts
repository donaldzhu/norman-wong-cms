

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

export const getSpanFromSingleCell = (cell: number) => ({ start: cell, end: cell + 1 })

