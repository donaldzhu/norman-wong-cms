import * as changeCase from 'change-case'

import { DESKTOP_COLUMN_COUNT, GRID_GAP, MOBILE_LANDSCAPE_COLUMN_COUNT, MOBILE_PORTRAIT_ROW_COUNT } from '../components/projectSlide/configs'

import { DeviceType } from '../components/types/selectedWorks'
import { Orientation } from '../constants/enum'

export const getSlideGridKeyPath = (
  key: string,
  deviceType: DeviceType,
  alignment: 'start' | 'end'
) => [
    'media',
    { _key: key },
    `${deviceType}${changeCase.capitalCase(alignment)}`,
  ]

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
  const template = `repeat(${gridCount}, minmax(0, 1fr))`

  return {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: isPortrait ? '1fr' : template,
    gridTemplateRows: isPortrait ? template : '1fr',
    gap: `${gap}px`,
  } as const
}