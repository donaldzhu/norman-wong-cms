import * as changeCase from 'change-case'

import { DESKTOP_COLUMN_COUNT, GRID_GAP, MOBILE_LANDSCAPE_COLUMN_COUNT, MOBILE_PORTRAIT_ROW_COUNT } from '../components/projectSlide/configs'

import { DeviceType } from '../components/types/gridLayout'
import { Orientation } from '../constants/enum'
import type { ProjectSlideGridValue } from '../components/types/media'

export const GRID_SETTINGS_INCOMPLETE_MESSAGE = 'Grid settings incomplete'

export const getSpanFromCells = (a: number, b: number) => {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return { start: lo, end: hi + 1 }
}

export const getSpanFromSingleCell = (cell: number) => ({ start: cell, end: cell + 1 })

export const getSlideGridKeyPath = (
  key: string,
  deviceType: DeviceType,
  alignment: 'start' | 'end'
) => [
    'media',
    { _key: key },
    `${deviceType}${changeCase.capitalCase(alignment)}`,
  ]


export const validateSpan = (
  start: number | undefined,
  end: number | undefined,
  deviceType: DeviceType,
  orientation: Orientation = Orientation.LANDSCAPE
) => {
  const cellCount = getGridCellCount(deviceType, orientation)
  const isMobile = deviceType === DeviceType.MOBILE
  const isPortrait = orientation === Orientation.PORTRAIT
  const decorateMessage = (message: string) => `${changeCase.capitalCase(deviceType)}: ${message}`
  const divType = isMobile && isPortrait ? 'row' : 'column'

  if (typeof start !== 'number' || typeof end !== 'number')
    return decorateMessage(`Missing start or end ${divType}.`)

  if (start < 1 || start > cellCount)
    return decorateMessage(`Invalid start ${divType}.`)

  if (end < 2 || end > cellCount + 1)
    return decorateMessage(`Invalid end ${divType}.`)

  if (end <= start)
    return decorateMessage(`End ${divType} must be greater than start ${divType}.`)

  return
}

export const getMediaGridSpanIssue = (
  item: Pick<ProjectSlideGridValue, 'desktopStart' | 'desktopEnd' | 'mobileStart' | 'mobileEnd'>,
  orientation: Orientation = Orientation.PORTRAIT,
) => {
  const desktopIssue = validateSpan(item.desktopStart, item.desktopEnd, DeviceType.DESKTOP)
  if (desktopIssue) return desktopIssue

  return validateSpan(item.mobileStart, item.mobileEnd, DeviceType.MOBILE, orientation)
}

export const validateSlideGrid = (
  media: ProjectSlideGridValue[] = [],
  orientation: Orientation,
) => media.some(item => getMediaGridSpanIssue(item, orientation))

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