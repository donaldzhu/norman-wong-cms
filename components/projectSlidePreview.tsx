import createImageUrlBuilder from '@sanity/image-url'
import { Box, Flex, Stack, Text } from '@sanity/ui'
import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { PreviewProps, useClient } from 'sanity'

const SANITY_CLIENT_OPTIONS = { apiVersion: '2024-01-01' as const }

type SlideMediaRow = {
  type?: string
  image?: { asset?: { _ref?: string } }
  video?: { asset?: { _ref?: string } }
}

type ProjectSlidePreviewProps = PreviewProps & {
  description?: string
  year?: number
  slideMedia?: SlideMediaRow[]
}

function isSanityImageAssetRef(ref: string | undefined): ref is string {
  return typeof ref === 'string' && ref.startsWith('image-')
}

function imageThumbUrl(
  builder: ReturnType<typeof createImageUrlBuilder>,
  imageRef: string,
): string | undefined {
  try {
    return builder
      .image({ asset: { _type: 'reference', _ref: imageRef } })
      .width(200)
      .height(200)
      .fit('crop')
      .url()
  } catch {
    return undefined
  }
}

/**
 * Fully custom list preview: do not use `renderDefault` / `SanityDefaultMedia`.
 * Studio infers `media` from the schema field name `media` and may pass array values into
 * `useImageUrl`, which blows up on Mux refs and other non–image-asset ids.
 */
export function ProjectSlidePreview(props: PreviewProps): ReactElement {
  const { description, year, slideMedia: mediaRaw } = props as ProjectSlidePreviewProps
  const rows = useMemo(() => (Array.isArray(mediaRaw) ? mediaRaw : []), [mediaRaw])
  const client = useClient(SANITY_CLIENT_OPTIONS)
  const builder = useMemo(() => createImageUrlBuilder(client), [client])

  const muxAssetIds = useMemo(() => {
    const ids = new Set<string>()
    for (const row of rows) {
      if (row?.type === 'video' && row.video?.asset?._ref) ids.add(row.video.asset._ref)
    }
    return [...ids]
  }, [rows])

  const [muxPlaybackById, setMuxPlaybackById] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!muxAssetIds.length) {
      setMuxPlaybackById(prev => (Object.keys(prev).length === 0 ? prev : {}))
      return
    }
    let cancelled = false
    client
      .fetch<Array<{ _id: string; playbackId?: string }>>(
        `*[_type == "mux.videoAsset" && _id in $ids]{ _id, playbackId }`,
        { ids: muxAssetIds },
      )
      .then(result => {
        if (cancelled) return
        const next: Record<string, string> = {}
        for (const r of result) {
          if (r.playbackId) next[r._id] = r.playbackId
        }
        setMuxPlaybackById(next)
      })
      .catch(() => {
        if (!cancelled) setMuxPlaybackById({})
      })
    return () => {
      cancelled = true
    }
  }, [client, muxAssetIds])

  const first = rows[0]
  let thumbUrl: string | undefined

  const imageRef = first?.type === 'image' ? first.image?.asset?._ref : undefined
  if (imageRef && isSanityImageAssetRef(imageRef)) {
    thumbUrl = imageThumbUrl(builder, imageRef)
  } else if (first?.type === 'video') {
    const ref = first.video?.asset?._ref
    const playbackId = ref ? muxPlaybackById[ref] : undefined
    thumbUrl = playbackId
      ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=200&height=200&fit_mode=smartcrop`
      : undefined
  }

  const titleParts: string[] = []
  if (description) titleParts.push(description)
  if (year != null) titleParts.push(String(year))
  const title = titleParts.length ? titleParts.join(' · ') : 'Untitled'

  const subtitleParts: string[] = []
  const imageCounter = rows.filter(r => r.type === 'image').length
  const videoCounter = rows.filter(r => r.type === 'video').length
  if (imageCounter) subtitleParts.push(`${imageCounter} images`)
  if (videoCounter) subtitleParts.push(`${videoCounter} videos`)
  const subtitle = subtitleParts.length ? subtitleParts.join(' · ') : 'No media'

  return (
    <Flex align="center" gap={3}>
      <Box
        flex="none"
        style={{
          width: 44,
          height: 44,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'var(--card-muted-bg-color)',
        }}
      >
        {thumbUrl ? (
          <img
            alt=""
            src={thumbUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : null}
      </Box>
      <Stack space={2} flex={1} style={{ minWidth: 0 }}>
        <Text size={1} weight="semibold" textOverflow="ellipsis">
          {title}
        </Text>
        <Text size={1} muted textOverflow="ellipsis">
          {subtitle}
        </Text>
      </Stack>
    </Flex>
  )
}
