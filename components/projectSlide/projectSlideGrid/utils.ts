import * as changeCase from 'change-case'

import { DESKTOP_COLUMN_COUNT, GRID_GAP, MOBILE_LANDSCAPE_COLUMN_COUNT, MOBILE_PORTRAIT_ROW_COUNT } from './configs'

import { DeviceType } from './types'
import { Orientation } from '../../../constants/enum'

export const getSlideGridKeyPath = (
  key: string,
  deviceType: DeviceType,
  alignment: 'start' | 'end'
) => [
    'media',
    { _key: key },
    `${deviceType}${changeCase.capitalCase(alignment)}`,
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

export const isValidSpan = (start: number | undefined, end: number | undefined, cellCount: number) => (
  typeof start === 'number' &&
  typeof end === 'number' &&
  start >= 1 &&
  start <= cellCount &&
  end >= 2 &&
  end < cellCount &&
  end > start
)

export const getGridCellCount = (tab: DeviceType, orientation: Orientation = Orientation.LANDSCAPE) => {
  if (tab === DeviceType.DESKTOP) return DESKTOP_COLUMN_COUNT
  if (orientation === Orientation.PORTRAIT) return MOBILE_PORTRAIT_ROW_COUNT
  return MOBILE_LANDSCAPE_COLUMN_COUNT
}

export const getGridStyle = (tab: DeviceType, orientation: Orientation) => {
  const isMobile = tab === DeviceType.MOBILE
  const isPortrait = isMobile && orientation === Orientation.PORTRAIT
  const gridCount = getGridCellCount(tab, orientation)
  const gap = isMobile ? GRID_GAP : GRID_GAP

  return {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: isPortrait ? '1fr' : `repeat(${gridCount}, minmax(0, 1fr))`,
    gridTemplateRows: isPortrait ? `repeat(${gridCount}, minmax(0, 1fr))` : '1fr',
    gap: `${gap}px`,
  } as const
}