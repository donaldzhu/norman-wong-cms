import type { CSSProperties } from 'react'

export const mobilePreviewFrameStyle = (isPortrait: boolean): CSSProperties => ({
  position: 'relative',
  width: isPortrait ? 'min(45%, 280px)' : '100%',
  maxWidth: 480,
  aspectRatio: '1 / 2',
  background: 'var(--card-border-color, rgba(127,127,127,0.22))',
  borderRadius: 4,
  overflow: 'hidden',
})
