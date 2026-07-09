import * as changeCase from 'change-case'

import { DESKTOP_COLUMN_COUNT, GRID_GAP, MOBILE_LANDSCAPE_COLUMN_COUNT, MOBILE_PORTRAIT_ROW_COUNT } from '../components/projectSlide/configs'

import { DeviceType } from '../components/types/gridLayout'
import { MediaType, Orientation } from '../constants/enum'
import type { AssetRef, ProjectSlideGridValue } from '../components/types/media'

export const GRID_SETTINGS_INCOMPLETE_MESSAGE = 'Grid settings incomplete'

type SlideMediaItem = Pick<
  ProjectSlideGridValue,
  'mediaType' | 'image' | 'video' | 'mobileMediaType' | 'mobileImage' | 'mobileVideo'
>

type DesktopMediaItem = Pick<ProjectSlideGridValue, 'mediaType' | 'image' | 'video'>

export const isDesktopMediaUnset = (item?: unknown) => {
  const parent = item as DesktopMediaItem | undefined
  const isVideo = parent?.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? parent?.video : parent?.image
  return !mediaWithRef?.asset?._ref
}

export const getProjectSlideMediaForDevice = (
  item: SlideMediaItem,
  deviceType: DeviceType,
): { mediaType: MediaType; mediaWithRef: AssetRef } | null => {
  if (deviceType === DeviceType.DESKTOP) {
    const isVideo = item.mediaType === MediaType.VIDEO
    const mediaWithRef = isVideo ? item.video : item.image
    if (!mediaWithRef?.asset?._ref) return null
    return {
      mediaType: isVideo ? MediaType.VIDEO : MediaType.IMAGE,
      mediaWithRef,
    }
  }

  const mobileMediaType = item.mobileMediaType ?? item.mediaType ?? MediaType.IMAGE
  const isMobileVideo = mobileMediaType === MediaType.VIDEO

  if (isMobileVideo && item.mobileVideo?.asset?._ref) {
    return { mediaType: MediaType.VIDEO, mediaWithRef: item.mobileVideo }
  }
  if (!isMobileVideo && item.mobileImage?.asset?._ref) {
    return { mediaType: MediaType.IMAGE, mediaWithRef: item.mobileImage }
  }

  const isVideo = item.mediaType === MediaType.VIDEO
  const mediaWithRef = isVideo ? item.video : item.image
  if (!mediaWithRef?.asset?._ref) return null
  return {
    mediaType: isVideo ? MediaType.VIDEO : MediaType.IMAGE,
    mediaWithRef,
  }
}

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