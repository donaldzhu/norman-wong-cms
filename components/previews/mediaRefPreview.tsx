import { useEffect, useMemo, useState } from 'react'

import { Box } from '@sanity/ui'
import { DocumentIcon } from '@sanity/icons'
import { createImageUrlBuilder } from '@sanity/image-url'
import { useClient } from 'sanity'

const SANITY_CLIENT_OPTIONS = { apiVersion: '2026-05-01' } as const
const THUMBNAIL_SIZE = 33
const SANITY_IMAGE_SIZE = 200

export interface MediaData {
  mediaType: 'image' | 'video'
  image?: { asset?: { _ref?: string } }
  video?: { asset?: { _ref?: string } }
}

type ProjectSlidePreviewProps = {
  data?: MediaData[]
}

const imageThumbUrl = (
  builder: ReturnType<typeof createImageUrlBuilder>,
  imageRef: string,
): string | undefined => {

  try {
    return builder
      .image({ asset: { _type: 'reference', _ref: imageRef } })
      .width(SANITY_IMAGE_SIZE)
      .height(SANITY_IMAGE_SIZE)
      .fit('crop')
      .url()
  } catch {
    return undefined
  }
}

export const MediaRefPreview = ({ data: _data }: ProjectSlidePreviewProps) => {
  const data = useMemo(() => (Array.isArray(_data) ? _data : []), [_data])
  const first = data[0]
  const client = useClient(SANITY_CLIENT_OPTIONS)
  const builder = useMemo(() => createImageUrlBuilder(client), [client])

  const muxAssetId = useMemo(() => {
    if (first?.mediaType === 'video' && first.video?.asset?._ref) return first.video.asset._ref
    return undefined
  }, [data])

  const [muxPlaybackById, setMuxPlaybackById] = useState<string>()

  useEffect(() => {
    if (!muxAssetId) return setMuxPlaybackById(undefined)
    let cancelled = false
    client
      .fetch<Array<{ _id: string; playbackId?: string }>>(
        `*[_type == "mux.videoAsset" && _id == $id]{ _id, playbackId }`,
        { id: muxAssetId },
      )
      .then(result => {
        if (cancelled) return
        setMuxPlaybackById(result[0].playbackId)
      })
      .catch(() => {
        if (!cancelled) setMuxPlaybackById(undefined)
      })
    return () => { cancelled = true }
  }, [muxAssetId, client])


  const imageRef = first?.mediaType === 'image' ? first.image?.asset?._ref : undefined
  const thumbUrl = imageRef ?
    imageThumbUrl(builder, imageRef) :
    first?.mediaType === 'video' && muxPlaybackById ?
      `https://image.mux.com/${muxPlaybackById}/thumbnail.jpg?width=200&height=200&fit_mode=smartcrop` :
      undefined

  return (
    <Box
      flex="none"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
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
      ) : <DocumentIcon width={THUMBNAIL_SIZE} height={21} />}
    </Box>
  )
}
