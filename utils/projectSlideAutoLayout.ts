import { DeviceType } from '../components/types/gridLayout'
import { Orientation } from '../constants/enum'
import { getSlideGridKeyPath } from './projectSlide'
import { set } from 'sanity'

export type SlideAutoLayoutPreset = 'center' | 'justified'

interface Span {
  start: number
  end: number
}

type MediaCount = 1 | 2 | 3 | 4

type LayoutByCount = Record<MediaCount, Span[]>

const toSpan = (start: number, end: number): Span => ({ start, end })

const CENTER_LAYOUTS: { desktop: LayoutByCount; mobile: LayoutByCount } = {
  desktop: {
    1: [toSpan(10, 16)],
    2: [toSpan(7, 13), toSpan(13, 19)],
    3: [toSpan(4, 10), toSpan(10, 15), toSpan(16, 22)],
    4: [toSpan(1, 7), toSpan(7, 13), toSpan(13, 19), toSpan(19, 25)],
  },
  mobile: {
    1: [toSpan(4, 10)],
    2: [toSpan(1, 7), toSpan(7, 13)],
    3: [toSpan(1, 5), toSpan(5, 9), toSpan(9, 13)],
    4: [toSpan(1, 4), toSpan(4, 7), toSpan(7, 10), toSpan(10, 13)],
  },
}

const JUSTIFIED_LAYOUTS: { desktop: LayoutByCount; mobile: LayoutByCount } = {
  desktop: {
    1: [toSpan(1, 25)],
    2: [toSpan(1, 13), toSpan(14, 25)],
    3: [toSpan(1, 9), toSpan(9, 17), toSpan(17, 25)],
    4: [toSpan(1, 7), toSpan(7, 13), toSpan(13, 19), toSpan(19, 25)],
  },
  mobile: {
    1: [toSpan(1, 13)],
    2: [toSpan(1, 7), toSpan(7, 13)],
    3: [toSpan(1, 5), toSpan(5, 9), toSpan(9, 13)],
    4: [toSpan(1, 4), toSpan(4, 7), toSpan(7, 10), toSpan(10, 13)],
  },
}

export const SLIDE_AUTO_LAYOUTS: Record<
  SlideAutoLayoutPreset,
  { desktop: LayoutByCount; mobile: LayoutByCount }
> = {
  center: CENTER_LAYOUTS,
  justified: JUSTIFIED_LAYOUTS,
}

const isMediaCount = (count: number): count is MediaCount =>
  count === 1 || count === 2 || count === 3 || count === 4

export const buildAutoLayoutPatches = (
  mediaKeys: string[],
  preset: SlideAutoLayoutPreset,
) => {
  const count = mediaKeys.length
  if (!isMediaCount(count)) return []

  const layouts = SLIDE_AUTO_LAYOUTS[preset]
  const desktopSpans = layouts.desktop[count]
  const mobileSpans = layouts.mobile[count]

  const patches = [set(Orientation.LANDSCAPE, ['mobileOrientation'])]

  mediaKeys.forEach((key, index) => {
    const desktop = desktopSpans[index]
    const mobile = mobileSpans[index]
    patches.push(
      set(desktop.start, getSlideGridKeyPath(key, DeviceType.DESKTOP, 'start')),
      set(desktop.end, getSlideGridKeyPath(key, DeviceType.DESKTOP, 'end')),
      set(mobile.start, getSlideGridKeyPath(key, DeviceType.MOBILE, 'start')),
      set(mobile.end, getSlideGridKeyPath(key, DeviceType.MOBILE, 'end')),
    )
  })

  return patches
}
