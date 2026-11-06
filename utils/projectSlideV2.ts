import type { ProjectSlideFormValue } from '../components/types/media'
export interface SlideLayoutV2 {
  _type: 'projectSlideLayoutV2'
  version: 2
  desktop: { _type: 'projectSlideDesktopLayout'; mode: 'center' | 'justify' }
  mobile: { _type: 'projectSlideMobileLayout'; auto: boolean; orientation: 'portrait' | 'landscape'; mode: 'center' | 'justify' }
}
export function validSlideV2(slide?: ProjectSlideFormValue): boolean {
  return slideV2Error(slide) === undefined
}

export function slideV2Error(slide?: ProjectSlideFormValue): string | undefined {
  const v = slide?.layoutV2, media = slide?.media ?? []
  if (!v || v.version !== 2 || !media.length || media.length > 4 || media.some(m => !m._key) || new Set(media.map(m => m._key)).size !== media.length) return 'Slide layout settings incomplete'
  if (!['center','justify'].includes(v.desktop?.mode) || !['center','justify'].includes(v.mobile?.mode) || typeof v.mobile?.auto !== 'boolean' || !['portrait','landscape'].includes(v.mobile?.orientation)) return 'Slide layout settings incomplete'
  if ((v.desktop.mode === 'justify' || (!v.mobile.auto && v.mobile.mode === 'justify')) && media.length !== 1) return 'Justify requires one media item. Choose Center.'
  if (!media.every(m => [6,8,10,12,14,16].includes(m.desktopSpan!) && Number.isInteger(m.mobileSpan) && m.mobileSpan! >= 1 && m.mobileSpan! <= 11)) return 'Choose a size for each media item.'
  if (v.desktop.mode === 'center' && media.reduce((n,m) => n + m.desktopSpan!,0) > 24) return 'Layout exceeds max column size (24).'
  // Retained manual settings become active only when Auto is switched off.
  if (!v.mobile.auto && v.mobile.mode === 'center' && media.reduce((n,m) => n + m.mobileSpan!,0) > 12) return 'Layout exceeds max column size (12).'
  return undefined
}
