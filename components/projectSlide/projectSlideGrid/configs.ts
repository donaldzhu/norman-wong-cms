/** Number of visible cells in each project slide range strip variant. */
export const DESKTOP_COLUMN_COUNT = 24
export const MOBILE_PORTRAIT_ROW_COUNT = 12
export const MOBILE_LANDSCAPE_COLUMN_COUNT = 12

/** Stored `start` is the left edge index (1–24); stored `end` is the right edge (2–25). */
export const EDGE_START_MIN = 1
export const EDGE_START_MAX = DESKTOP_COLUMN_COUNT
export const EDGE_END_MIN = 2
export const EDGE_END_MAX = DESKTOP_COLUMN_COUNT + 1

export const GRID_GAP = 15
