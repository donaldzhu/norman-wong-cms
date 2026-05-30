import { Flex, Spinner } from '@sanity/ui'
import { useEffect, useMemo, useState } from 'react'

import type { AssetRef } from '../types/media'
import { MediaType } from '../../constants/enum'
import { SANITY_CLIENT_OPTIONS } from '../../constants/configs'
import { createImageUrlBuilder } from '@sanity/image-url'
import { useClient } from 'sanity'

interface MediaRefPreviewProps {
  mediaType?: MediaType
  mediaWithRef?: AssetRef
  style?: React.CSSProperties
  sanityImageWidth?: number
  spinnerSize?: number | string
  showSpinner?: boolean
}

const imageThumbUrl = (
  builder: ReturnType<typeof createImageUrlBuilder>,
  imageRef: string,
  sanityImageWidth: number,
) => {
  try {
    return builder
      .image({ asset: { _type: 'reference', _ref: imageRef } })
      .width(sanityImageWidth)
      .fit('crop')
      .url()
  } catch { }
}

export const MediaRefPreview = ({
  mediaWithRef,
  mediaType,
  style,
  sanityImageWidth = 200,
  spinnerSize = '100%',
  showSpinner = false,
}: MediaRefPreviewProps) => {
  const client = useClient(SANITY_CLIENT_OPTIONS)
  const builder = useMemo(() => createImageUrlBuilder(client), [client])

  const mediaRef = mediaWithRef?.asset?._ref
  const [muxPlaybackById, setMuxPlaybackById] = useState<string | undefined>()

  useEffect(() => {
    if (!mediaRef || mediaType !== MediaType.VIDEO) return setMuxPlaybackById(undefined)
    let cancelled = false
    client
      .fetch<Array<{ _id: string; playbackId?: string }>>(
        `*[_type == "mux.videoAsset" && _id == $id]{ _id, playbackId }`,
        { id: mediaRef },
      )
      .then(result => {
        if (cancelled) return
        setMuxPlaybackById(result[0].playbackId)
      })
      .catch(() => {
        if (!cancelled) setMuxPlaybackById(undefined)
      })
    return () => { cancelled = true }
  }, [mediaRef, client])

  const thumbUrl = !mediaRef ? undefined :
    mediaType === MediaType.IMAGE ?
      imageThumbUrl(builder, mediaRef, sanityImageWidth) :
      mediaType === MediaType.VIDEO && muxPlaybackById ?
        `https://image.mux.com/${muxPlaybackById}/thumbnail.jpg?time=0&width=${sanityImageWidth}&height=${sanityImageWidth}&fit_mode=smartcrop` :
        undefined

  return (
    thumbUrl ? (
      <img
        alt=""
        src={thumbUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          ...style,
        }}
      />
    ) : showSpinner && (
      <Flex justify="center" align="center" padding={5} style={{
        width: spinnerSize,
        height: spinnerSize,
        boxSizing: 'border-box',
      }} >
        <Spinner muted />
      </Flex>
    )
  )
}

