export interface ImageFraming {
  crop?: { left?: number; right?: number; top?: number; bottom?: number }
  hotspot?: { x?: number; y?: number }
}
const fraction = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback

export function croppedRatio(ratio: number, image?: ImageFraming): number {
  const width = 1 - fraction(image?.crop?.left, 0) - fraction(image?.crop?.right, 0)
  const height = 1 - fraction(image?.crop?.top, 0) - fraction(image?.crop?.bottom, 0)
  return width > 0 && height > 0 ? ratio * width / height : ratio
}

// Position the focal point at the centre of a cover frame, clamped to image edges.
export function hotspotPosition(image: ImageFraming | undefined, ratio: number, width: number, height: number): string {
  if (!image?.hotspot || !(ratio > 0 && width > 0 && height > 0)) return '50% 50%'
  const left = fraction(image.crop?.left, 0), top = fraction(image.crop?.top, 0)
  const cropWidth = 1 - left - fraction(image.crop?.right, 0)
  const cropHeight = 1 - top - fraction(image.crop?.bottom, 0)
  if (cropWidth <= 0 || cropHeight <= 0) return '50% 50%'
  const x = (fraction(image.hotspot.x, 0.5) - left) / cropWidth
  const y = (fraction(image.hotspot.y, 0.5) - top) / cropHeight
  const frameRatio = width / height
  const position = (focal: number, visible: number) => visible >= 1 ? 50 : Math.max(0, Math.min(1, (focal - visible / 2) / (1 - visible))) * 100
  return `${position(x, Math.min(1, frameRatio / ratio))}% ${position(y, Math.min(1, ratio / frameRatio))}%`
}
