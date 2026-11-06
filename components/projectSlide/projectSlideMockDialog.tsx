import { croppedRatio } from '../../utils/imageFraming'
import { slideV2Error, validSlideV2, type SlideLayoutV2 } from '../../utils/projectSlideV2'
import { createImageUrlBuilder } from '@sanity/image-url'
import { Box, Button, Card, Dialog, Flex, Stack, Text, Tooltip, Switch, Select } from '@sanity/ui'
import { useEffect, useMemo, useState, useRef, type ReactElement } from 'react'
import { useClient } from 'sanity'

import { SANITY_CLIENT_OPTIONS } from '../../constants/configs'
import { MediaType } from '../../constants/enum'
import {
  initialMockLayout, initialMobileLayout, MOBILE_SIZES, autoMobileSpan,
  MOCK_COLUMN_LIMIT,
  MOCK_SIZES,
  mockBudget,
  type MockMode,
} from '../../utils/projectSlideMockLayout'
import type { ProjectSlideFormValue, ProjectSlideGridValue } from '../types/media'
import { ProjectSlideMockPreview, type MockAsset } from './projectSlideMockPreview'

interface Props {
  value?: ProjectSlideFormValue
  onLayoutChange?: (layout: SlideLayoutV2, spans: { _key: string; desktopSpan: number; mobileSpan: number }[]) => void
  onClose: () => void
}

function desktopInitial(value?: ProjectSlideFormValue) {
  if (value?.layoutV2?.version !== 2) return initialMockLayout(value?.media ?? [])
  return { mode: value.layoutV2.desktop?.mode ?? 'center', sizes: Object.fromEntries((value.media ?? []).map(m => [m._key, String(MOCK_SIZES.indexOf(m.desktopSpan as typeof MOCK_SIZES[number]) + 1)])) }
}
function mobileInitial(value?: ProjectSlideFormValue) {
  if (value?.layoutV2?.version !== 2) return initialMobileLayout(value?.media ?? [], value?.mobileOrientation)
  const v = value.layoutV2.mobile
  return { auto: v?.auto ?? true, orientation: v?.orientation ?? '', manual: { mode: v?.mode ?? 'center', spans: Object.fromEntries((value.media ?? []).map(m => [m._key, m.mobileSpan])) } }
}
const signatureFor = (media: ProjectSlideGridValue[], value?: ProjectSlideFormValue) => JSON.stringify([media, value?.mobileOrientation, value?.layoutV2], (_, entry) => entry && typeof entry === 'object' && !Array.isArray(entry) ? Object.fromEntries(Object.keys(entry).sort().map(key => [key, entry[key]])) : entry)

interface AssetDocument {
  _id: string
  playbackId?: string
  data?: { aspect_ratio?: string }
  metadata?: { dimensions?: { width?: number; height?: number; aspectRatio?: number } }
}

function mediaReference(item: ProjectSlideGridValue, mobile = false): string | undefined {
  return item.mediaType === MediaType.IMAGE ? (mobile ? item.mobileImage ?? item.image : item.image)?.asset?._ref :
    item.mediaType === MediaType.VIDEO ? (mobile ? item.mobileVideo ?? item.video : item.video)?.asset?._ref : undefined
}

function parseRatio(document: AssetDocument): number | undefined {
  const dimensions = document.metadata?.dimensions
  const imageRatio = dimensions?.aspectRatio ??
    (dimensions?.width && dimensions.height ? dimensions.width / dimensions.height : undefined)
  const videoParts = document.data?.aspect_ratio?.split(':').map(Number)
  const videoRatio = videoParts?.length === 2 ? videoParts[0] / videoParts[1] : undefined
  const ratio = imageRatio ?? videoRatio
  return ratio && Number.isFinite(ratio) && ratio > 0 ? ratio : undefined
}

interface PreviewLayout {
  mode: MockMode
  columns: number[]
  stacked: boolean
  signature: string
}

export const ProjectSlideMockDialog = ({ value, onClose, onLayoutChange }: Props): ReactElement => {
  const client = useClient(SANITY_CLIENT_OPTIONS)
  const builder = useMemo(() => createImageUrlBuilder(client), [client])
  const currentMedia = useMemo(() => value?.media ?? [], [value?.media])
  const currentSignature = signatureFor(currentMedia, value)
  const [snapshot, setSnapshot] = useState(() => ({ media: currentMedia, signature: currentSignature }))
  const [layout, setLayout] = useState(() => desktopInitial(value))
  const [mobile, setMobile] = useState(() => mobileInitial(value))
  const [preview, setPreview] = useState<'desktop' | 'mobile'>('desktop')
  const [lastValid, setLastValid] = useState<Partial<Record<'desktop' | 'mobile', PreviewLayout>>>({})
  const [documents, setDocuments] = useState<Record<string, AssetDocument>>({})
  const [requestStatus, setRequestStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const expectedSignature = useRef<string | null>(null)
  const edited = useRef(false)
  const stale = currentSignature !== snapshot.signature && currentSignature !== expectedSignature.current

  const refs = useMemo(() => [...new Set(snapshot.media.flatMap(item => [mediaReference(item), mediaReference(item, true)]).filter((ref): ref is string => Boolean(ref)))], [snapshot])
  useEffect(() => {
    let cancelled = false
    setDocuments({})
    if (refs.length === 0) {
      setRequestStatus('ready')
      return
    }
    setRequestStatus('loading')
    client.fetch<AssetDocument[]>(
      '*[_id in $ids]{_id, playbackId, data{aspect_ratio}, metadata{dimensions{width,height,aspectRatio}}}',
      { ids: refs },
    ).then(result => {
      if (cancelled) return
      setDocuments(Object.fromEntries(result.map(document => [document._id, document])))
      setRequestStatus('ready')
    }).catch(() => {
      if (!cancelled) setRequestStatus('error')
    })
    return () => { cancelled = true }
  }, [client, refs])

  const resolveAssets = (isMobile = false): MockAsset[] => snapshot.media.map(item => {
    const ref = mediaReference(item, isMobile)
    const document = ref ? documents[ref] : undefined
    if (requestStatus === 'loading' && ref) return { status: 'loading' }
    if (!ref || !document || requestStatus === 'error') return { status: 'missing' }
    let ratio = parseRatio(document)
    const image = item.mediaType === MediaType.IMAGE ? (isMobile ? item.mobileImage ?? item.image : item.image) : undefined
    let url: string | undefined
    if (item.mediaType === MediaType.IMAGE) {
      try {
        url = builder.image({ ...image, asset: { _type: 'reference', _ref: ref } }).width(1280).url()
        if (ratio) ratio = croppedRatio(ratio, image)
      } catch { /* The missing-asset state below covers invalid references. */ }
    } else if (item.mediaType === MediaType.VIDEO && document.playbackId) {
      url = `https://image.mux.com/${encodeURIComponent(document.playbackId)}/thumbnail.jpg?time=0&width=1280`
    }
    return ratio && url ? { status: 'ready', ratio, url, image } : { status: 'missing' }
  })

  const assets = resolveAssets()
  const mobileAssets = resolveAssets(true)
  const budget = mockBudget(snapshot.media, layout.sizes)
  const desktopValid = (layout.mode === 'justify' ? snapshot.media.length === 1 : budget.valid)
  const autoSpans = budget.columns.map(span => span === undefined ? undefined : autoMobileSpan(span))
  const mobileMode = mobile.auto ? layout.mode : mobile.manual?.mode ?? 'center'
  const mobileColumns = mobile.auto ? autoSpans : snapshot.media.map(item => mobile.manual?.spans[item._key])
  const mobileTotal = mobileColumns.reduce<number>((sum, span) => sum + (span ?? 0), 0)
  const orientationValid = ['portrait', 'landscape'].includes(mobile.orientation)
  const mobileValid = orientationValid && (mobile.auto ? desktopValid : mobileMode === 'justify' ? snapshot.media.length === 1 : snapshot.media.length > 0 && mobileColumns.every(span => span !== undefined) && mobileTotal <= 12)
  const keysValid = snapshot.media.every(item => item._key) && new Set(snapshot.media.map(item => item._key)).size === snapshot.media.length
  const valid = !stale && keysValid && (preview === 'mobile' ? mobileValid : desktopValid)
  const activeMode = preview === 'mobile' ? mobileMode : layout.mode
  const activeColumns = preview === 'mobile' ? mobileColumns : budget.columns
  const activeTotal = preview === 'mobile' ? mobileTotal : budget.total
  const activeLimit = preview === 'mobile' ? 12 : MOCK_COLUMN_LIMIT
  const overBudget = activeMode === 'center' && activeTotal > activeLimit
  const stacked = preview === 'mobile' && mobile.orientation === 'portrait'
  const columnSignature = JSON.stringify(activeColumns)
  useEffect(() => {
    if (!valid) return
    setLastValid(previous => ({ ...previous, [preview]: {
      mode: activeMode, columns: JSON.parse(columnSignature), stacked, signature: snapshot.signature,
    } }))
  }, [valid, preview, activeMode, columnSignature, stacked, snapshot.signature])
  const retained = lastValid[preview]?.signature === snapshot.signature ? lastValid[preview] : undefined
  // Keep each view's last valid geometry while size selections exceed its budget.
  const displayed = valid ? { mode: activeMode, columns: activeColumns as number[], stacked } :
    overBudget && !stale && keysValid && (preview !== 'mobile' || orientationValid) ? retained ?? { mode: 'center' as const, columns: [], stacked } : undefined
  const budgetError = overBudget && <Card padding={3} tone="critical" radius={2} role="status" aria-live="polite">
    <Text size={1}>Layout exceeds max column size ({activeLimit}).</Text>
  </Card>
  const savedManual = mobile.manual ?? { mode: layout.mode, spans: Object.fromEntries(snapshot.media.map((m,i) => [m._key, layout.mode === 'justify' ? 8 : autoSpans[i]])) }
  const candidate: SlideLayoutV2 = { _type: 'projectSlideLayoutV2', version: 2,
    desktop: { _type: 'projectSlideDesktopLayout', mode: layout.mode },
    mobile: { _type: 'projectSlideMobileLayout', auto: mobile.auto, orientation: mobile.orientation as 'portrait' | 'landscape', mode: savedManual.mode } }
  const candidateSpans = snapshot.media.map((m,i) => ({ _key: m._key, desktopSpan: budget.columns[i]!, mobileSpan: savedManual.spans[m._key]! }))
  const saveError = slideV2Error({ layoutV2: candidate, media: candidateSpans })
  const candidateSignature = JSON.stringify([candidate, candidateSpans])
  useEffect(() => {
    if (!onLayoutChange || !edited.current || stale) return
    const nextMedia = currentMedia.map(m => ({ ...m, ...candidateSpans.find(s => s._key === m._key) }))
    if (!validSlideV2({ layoutV2: candidate, media: nextMedia })) return
    expectedSignature.current = signatureFor(nextMedia, { ...value, layoutV2: candidate })
    edited.current = false
    onLayoutChange(candidate, candidateSpans)
  }, [candidateSignature, stale, onLayoutChange])
  const invalidInput = layout.mode === 'center' && budget.columns.some(column => column === undefined)
  const reloadPreview = () => {
    setSnapshot({ media: currentMedia, signature: currentSignature })
    setLayout(desktopInitial(value))
    setMobile(mobileInitial(value))
    setPreview('desktop')
    setLastValid({})
    expectedSignature.current = null
    edited.current = false
  }
  const setSize = (key: string, size: string) => { edited.current = true; setLayout(previous => ({
    ...previous,
    sizes: { ...previous.sizes, [key]: size },
  })) }
  const setMode = (mode: MockMode) => {
    edited.current = true
    setLayout(previous => ({ ...previous, mode }))
    // Also recover the retained mobile mode on slides saved before the media-add guard.
    if (mode === 'center' && snapshot.media.length > 1) {
      setMobile(previous => previous.manual?.mode === 'justify'
        ? { ...previous, manual: { ...previous.manual, mode: 'center' } } : previous)
    }
  }

  return (
    <Dialog
      header={onLayoutChange ? 'Slide planner' : 'Slide planner · mock'}
      id="project-slide-mock-planner"
      open
      onClose={onClose}
      width={4}
      zOffset={1000}
      style={{ maxHeight: '90vh' }}
    >
      <Box padding={4}>
        <Stack space={4}>
          <Flex gap={3} align="center" wrap="wrap">
            <Flex gap={2}>
              <Button type="button" text="Desktop" aria-pressed={preview === 'desktop'} tone={preview === 'desktop' ? 'primary' : 'default'} onClick={() => setPreview('desktop')} />
              <Tooltip disabled={!mobile.auto} content={<Box padding={2}><Text size={1}>Turn off Auto layout for mobile to edit mobile settings.</Text></Box>}>
                <span tabIndex={mobile.auto ? 0 : undefined} aria-label={mobile.auto ? 'Turn off Auto layout for mobile to edit mobile settings.' : undefined}>
                  <Button type="button" text="Mobile" disabled={mobile.auto} aria-pressed={preview === 'mobile'} tone={preview === 'mobile' ? 'primary' : 'default'} onClick={() => setPreview('mobile')} />
                </span>
              </Tooltip>
            </Flex>
            <Flex gap={2} align="center" style={{ marginLeft: 'auto' }}>
              <Switch id="mock-mobile-auto" checked={mobile.auto} onChange={() => {
                edited.current = true
                if (!mobile.auto) setPreview('desktop')
                setMobile(previous => ({ ...previous, auto: !previous.auto, manual: previous.manual ?? { mode: layout.mode, spans: Object.fromEntries(snapshot.media.map((item, i) => [item._key, layout.mode === 'justify' ? 8 : autoSpans[i]])) } }))
              }} />
              <label htmlFor="mock-mobile-auto" style={{ cursor: 'pointer' }}><Text size={1}>Auto layout for mobile</Text></label>
            </Flex>
          </Flex>
          {displayed ? <ProjectSlideMockPreview mode={displayed.mode} columns={displayed.columns} assets={displayed.columns.length ? preview === 'mobile' ? mobileAssets : assets : []} mobile={preview === 'mobile'} stacked={displayed.stacked} /> :
            <Card padding={4} tone="caution" border><Text size={1}>
              {stale ? 'Slide changed — reload preview.' : snapshot.media.length === 0 ? 'This slide has no media.' :
                !keysValid ? 'Media keys are missing or duplicated.' :
                activeMode === 'justify' && snapshot.media.length !== 1 ? 'Justify requires one media item. Choose Center.' :
                preview === 'mobile' ? !orientationValid ? 'Choose a mobile orientation.' : mobile.auto && !desktopValid ? 'Choose valid desktop sizes to preview Auto mobile.' : mobileColumns.some(span => span === undefined) ? 'Choose a size for each media item.' : `Reduce by ${Math.max(0, mobileTotal - 12)} columns.` :
                invalidInput ? 'Choose a size for each media item.' :
                  budget.total > MOCK_COLUMN_LIMIT ? `Reduce by ${budget.total - MOCK_COLUMN_LIMIT} columns.` :
                    'Layout unavailable.'}
            </Text></Card>}

          {stale && <Button type="button" text="Reload preview" mode="ghost" onClick={reloadPreview} />}
          {preview === 'desktop' && <>
          <Flex gap={2} align="center" wrap="wrap">
            <Button type="button" text="Center" aria-pressed={layout.mode === 'center'} tone={layout.mode === 'center' ? 'primary' : 'default'} onClick={() => setMode('center')} />
            <Tooltip
              disabled={snapshot.media.length === 1}
              content={<Box padding={2}><Text size={1}>Justify is only available for slides with one media item.</Text></Box>}
              placement="top"
            >
              <span tabIndex={snapshot.media.length !== 1 ? 0 : undefined} aria-label={snapshot.media.length !== 1 ? 'Justify is only available for slides with one media item.' : undefined}>
                <Button type="button" text="Justify" aria-pressed={layout.mode === 'justify'} tone={layout.mode === 'justify' ? 'primary' : 'default'} disabled={snapshot.media.length !== 1} onClick={() => setMode('justify')} />
              </span>
            </Tooltip>
            {layout.mode === 'center' && <Box style={{ marginLeft: 'auto' }}><Text size={1} muted>{budget.total} / {MOCK_COLUMN_LIMIT} columns</Text></Box>}
          </Flex>
          {budgetError}
          {!overBudget && saveError && <Card padding={3} tone="critical" radius={2} role="status"><Text size={1}>{saveError}</Text></Card>}

          <Stack space={3}>
            {snapshot.media.map((item, index) => {
              const asset = assets[index]
              return <Card key={item._key || index} padding={3} radius={2} border>
                <Stack space={3}>
                  <Flex gap={3} align="center">
                    <div style={{ width: 76, height: 54, overflow: 'hidden', flexShrink: 0, background: '#252525', display: 'grid', placeItems: 'center' }}>
                      {asset.url ? <img src={asset.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> :
                        <Text size={0} muted>{asset.status === 'loading' ? 'Loading' : 'No preview'}</Text>}
                    </div>
                    <Text size={1}>Media {index + 1} · {item.mediaType === MediaType.VIDEO ? 'Video' : 'Image'}</Text>
                  </Flex>
                  {layout.mode === 'center' && <Flex gap={2} wrap="wrap" role="group" aria-label={`Size for media ${index + 1}`}>
                    {MOCK_SIZES.map((columns, sizeIndex) => {
                      const size = String(sizeIndex + 1)
                      const selected = layout.sizes[item._key] === size
                      return <Button
                        key={columns}
                        type="button"
                        text={`${['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'][sizeIndex]} (${columns})`}
                        aria-pressed={selected}
                        tone={selected ? 'primary' : 'default'}
                        mode={selected ? 'default' : 'ghost'}
                        onClick={() => setSize(item._key, size)}
                      />
                    })}
                  </Flex>}
                </Stack>
              </Card>
            })}
          </Stack>

          </>}

          {preview === 'mobile' && !mobile.auto && <Stack space={3}>
            <Flex gap={2} align="center">
              {!mobile.auto && <>{(['center', 'justify'] as const).map(mode => <Tooltip key={mode} disabled={mode !== 'justify' || snapshot.media.length === 1} content={<Box padding={2}><Text size={1}>Justify is only available for slides with one media item.</Text></Box>}><span tabIndex={mode === 'justify' && snapshot.media.length !== 1 ? 0 : undefined}><Button type="button" text={mode === 'center' ? 'Center' : 'Justify'} disabled={mode === 'justify' && snapshot.media.length !== 1} aria-pressed={mobileMode === mode} tone={mobileMode === mode ? 'primary' : 'default'} onClick={() => { edited.current = true; setMobile(previous => ({ ...previous, manual: { ...previous.manual!, mode } })) }} /></span></Tooltip>)}</>}
              {mobileMode === 'center' && <Text size={1} muted>{mobileTotal} / 12 columns</Text>}
            </Flex>
            {budgetError}
            {!overBudget && saveError && <Card padding={3} tone="critical" radius={2} role="status"><Text size={1}>{saveError}</Text></Card>}
            <Box paddingBottom={3}>
              <Stack space={3}>
            <label htmlFor="mock-mobile-orientation"><Text size={1}>Mobile orientation</Text></label>
            <Select id="mock-mobile-orientation" value={mobile.orientation} onChange={event => { edited.current = true; const orientation = event.currentTarget.value; setMobile(previous => ({ ...previous, orientation })) }}>
              {!orientationValid && <option value={mobile.orientation}>Choose orientation</option>}
              <option value="portrait">Portrait</option><option value="landscape">Landscape</option>
            </Select>
              </Stack>
            </Box>
            {!mobile.auto && mobileMode === 'center' && snapshot.media.map((item, index) => {
              const original = snapshot.media[index].mobileSpan ?? initialMobileLayout(snapshot.media).manual?.spans[item._key]
              const choices: number[] = [...MOBILE_SIZES]
              if (original !== undefined && !choices.includes(original)) choices.push(original)
              return <Card key={item._key || index} padding={3} radius={2} border><Stack space={3}>
                <Flex gap={3} align="center">{mobileAssets[index]?.url && <img src={mobileAssets[index].url} alt="" style={{ width: 76, height: 54, objectFit: 'contain' }} />}<Text size={1}>Media {index + 1}</Text></Flex>
                <Flex gap={2} wrap="wrap" role="group" aria-label={`Mobile size for media ${index + 1}`}>
                  {choices.map((span, i) => <Button key={span} type="button" text={`${i < 6 ? ['XS', 'S', 'M', 'L', 'XL', 'XXL'][i] : 'Existing'} (${span})`} aria-pressed={mobile.manual?.spans[item._key] === span} tone={mobile.manual?.spans[item._key] === span ? 'primary' : 'default'} onClick={() => { edited.current = true; setMobile(previous => ({ ...previous, manual: { mode: previous.manual?.mode ?? 'center', spans: { ...previous.manual?.spans, [item._key]: span } } })) }} />)}
                </Flex>
              </Stack></Card>
            })}
          </Stack>}

        </Stack>
      </Box>
    </Dialog>
  )
}
