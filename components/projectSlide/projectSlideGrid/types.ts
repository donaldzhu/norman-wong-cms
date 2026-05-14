import type { ProjectSlideGridValue } from '../../types/media'

export type MobilePlacement = {
  item: ProjectSlideGridValue
  start: number
  end: number
}

export interface GridSpan {
  start: number
  end: number
}