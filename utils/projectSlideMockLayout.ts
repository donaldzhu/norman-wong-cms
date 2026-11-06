import type { ProjectSlideGridValue } from '../components/types/media'

export const MOCK_SIZES = [6, 8, 10, 12, 14, 16, 18] as const
export const MOCK_COLUMN_LIMIT = 24
export const MOCK_VIEWPORT = { width: 1280, height: 720, gap: 20, gridBuffer: 8 } as const

export type MockMode = 'center' | 'justify'
export type MockSizes = Record<string, string>

const storedSpan = (item: ProjectSlideGridValue): number | undefined => {
  const { desktopStart: start, desktopEnd: end } = item
  return Number.isInteger(start) && Number.isInteger(end) && start! >= 1 && end! <= 25 && end! > start!
    ? end! - start!
    : undefined
}

export function initialMockLayout(media: ProjectSlideGridValue[]): { mode: MockMode; sizes: MockSizes } {
  const sizes: MockSizes = {}
  for (const item of media) {
    const span = storedSpan(item)
    const consolidated = span === 4 ? 6 : span === 9 ? 8 : span === 18 ? 16 : span
    const index = MOCK_SIZES.findIndex(size => size === consolidated)
    sizes[item._key] = index >= 0 ? String(index + 1) : span === 24 && media.length === 1 ? '6' : ''
  }
  return { mode: media.length === 1 && storedSpan(media[0]) === 24 ? 'justify' : 'center', sizes }
}

export function columnsForSize(value: string): number | undefined {
  if (!/^[1-7]$/.test(value)) return undefined
  return MOCK_SIZES[Number(value) - 1]
}

export function mockBudget(media: ProjectSlideGridValue[], sizes: MockSizes) {
  const columns = media.map(item => columnsForSize(sizes[item._key] ?? ''))
  const total = columns.reduce<number>((sum, value) => sum + (value ?? 0), 0)
  return { columns, total, valid: media.length > 0 && columns.every(value => value !== undefined) && total <= MOCK_COLUMN_LIMIT }
}

export function maxAvailableColumns(media: ProjectSlideGridValue[], sizes: MockSizes, currentKey: string): number | undefined {
  if (media.some(item => item._key !== currentKey && columnsForSize(sizes[item._key] ?? '') === undefined)) return undefined
  const otherTotal = media.reduce((total, item) => total + (item._key === currentKey ? 0 : columnsForSize(sizes[item._key] ?? '') ?? 0), 0)
  return [...MOCK_SIZES].reverse().find(size => size <= MOCK_COLUMN_LIMIT - otherTotal)
}

export const MOBILE_SIZES = [3, 4, 5, 6, 7, 8] as const
export const autoMobileSpan = (desktopSpan: number): number => desktopSpan === 18 ? 8 : desktopSpan / 2
export const MOBILE_VIEWPORT = { width: 390, height: 844, gap: 20, gridBuffer: 8 } as const
export interface MobileLayout {
  auto: boolean
  orientation: string
  manual: { mode: MockMode; spans: Record<string, number | undefined> } | null
}
export function initialMobileLayout(media: ProjectSlideGridValue[], orientation?: string): MobileLayout {
  const preset = ({1: 8, 2: 6, 3: 4, 4: 3} as Record<number, number>)[media.length]
  const spans = media.map(item => {
    const { mobileStart: start, mobileEnd: end } = item
    return Number.isInteger(start) && Number.isInteger(end) && start! >= 1 && end! <= 13 && end! > start! ? end! - start! : undefined
  })
  const auto = media.every(item => item.mobileStart == null && item.mobileEnd == null) ||
    (media.length > 0 && spans.every(span => span === preset))
  const justified = media.length === 1 && spans[0] === 12
  return { auto, orientation: orientation ?? 'landscape', manual: auto ? null : {
    mode: justified ? 'justify' : 'center',
    spans: Object.fromEntries(media.map((item, i) => [item._key, justified ? 8 : spans[i]])),
  } }
}
export function mockGeometry(columns: number[], ratios: number[], mobile = false, stacked = false) {
  const { width, height, gap, gridBuffer } = mobile ? MOBILE_VIEWPORT : MOCK_VIEWPORT
  const tracks = mobile ? 12 : 24
  const main = stacked ? height : width
  const cross = stacked ? width : height
  const resolvedGap = Math.min(gap, main / tracks)
  const track = (main + gridBuffer - (tracks - 1) * resolvedGap) / tracks
  const lengths = columns.map(count => count * track + (count - 1) * resolvedGap)
  const breadths = lengths.map((length, i) => stacked ? length * ratios[i] : length / ratios[i])
  const scale = Math.max(0, Math.min(1,
    (main - resolvedGap * Math.max(0, columns.length - 1)) / lengths.reduce((sum, value) => sum + value, 0),
    mobile ? cross / Math.max(...breadths) : 1))
  return lengths.map((length, i) => ({
    width: (stacked ? breadths[i] : length) * scale,
    height: (stacked ? length : breadths[i]) * scale,
  }))
}
