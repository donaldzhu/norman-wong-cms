export const getSpanFromCells = (a: number, b: number) => {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return { start: lo, end: hi + 1 }
}

export const getSpanFromSingleCell = (cell: number) => ({ start: cell, end: cell + 1 })

