import { hotspotPosition, type ImageFraming } from '../../utils/imageFraming'
import { Card, Flex, Text } from '@sanity/ui'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { mockGeometry, MOCK_VIEWPORT, MOBILE_VIEWPORT, type MockMode } from '../../utils/projectSlideMockLayout'

export interface MockAsset {
  image?: ImageFraming
  url?: string
  ratio?: number
  status: 'loading' | 'ready' | 'missing'
}

interface Props {
  mode: MockMode
  columns: number[]
  mobile?: boolean
  stacked?: boolean
  assets: MockAsset[]
}

export const ProjectSlideMockPreview = ({ mode, columns, assets, mobile = false, stacked = false }: Props): ReactElement => {
  const viewport = mobile ? MOBILE_VIEWPORT : MOCK_VIEWPORT
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [assets.map(asset => asset.url).join(), mobile])
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const element = host.current
    if (!element) return
    const update = () => setScale(Math.min(1, element.clientWidth / viewport.width, window.innerHeight * 0.4 / viewport.height))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [mobile])

  const ready = !failed && assets.every(asset => asset.status === 'ready' && asset.ratio && asset.url)
  const geometry = ready && mode === 'center' ? mockGeometry(columns, assets.map(asset => asset.ratio!), mobile, stacked) : []

  return (
    <div ref={host} style={{ width: '100%' }}>
      {ready ? (
        <div style={{ height: viewport.height * scale, width: viewport.width * scale, margin: '0 auto', overflow: 'hidden' }}>
          <div style={{
            width: viewport.width,
            height: viewport.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background: '#ffffff',
            display: 'flex',
            flexDirection: stacked ? 'column' : 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: mode === 'center' ? viewport.gap : 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}>
            {assets.map((asset, index) => <img
              key={index}
              src={asset.url}
              alt={`Media ${index + 1} preview`}
              draggable={false}
              onError={() => setFailed(true)}
              style={{
                display: 'block',
                flex: 'none',
                width: mode === 'justify' ? viewport.width : geometry[index].width,
                height: mode === 'justify' ? viewport.height : geometry[index].height,
                objectFit: mode === 'justify' ? 'cover' : 'contain',
                objectPosition: mode === 'justify' ? hotspotPosition(asset.image, asset.ratio!, viewport.width, viewport.height) : 'center',
              }}
            />)}
          </div>
        </div>
      ) : (
        <Card padding={4} tone="transparent" border>
          <Flex align="center" justify="center" style={{ minHeight: 160 }}>
            <Text muted size={1}>
              {failed || assets.some(asset => asset.status === 'missing') ? 'Media preview unavailable. Check the existing asset references.' : 'Loading media proportions and previews…'}
            </Text>
          </Flex>
        </Card>
      )}
    </div>
  )
}
