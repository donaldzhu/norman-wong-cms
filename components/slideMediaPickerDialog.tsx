import createImageUrlBuilder from '@sanity/image-url'
import { Box, Button, Dialog, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useClient } from 'sanity'

import { ReferencedAssetGrid } from './referencedAssetGrid'
import { ReferencedMuxGrid, type MuxAssetThumb } from './referencedMuxGrid'
import {
  assetRefsFromAllProjectSlideDocs,
  muxVideoAssetRefsFromAllProjectSlideDocs,
} from '../utils/refs'

/** Stable reference — inline `{ apiVersion }` changes every render and can make `useClient` unstable. */
const SANITY_CLIENT_OPTIONS = { apiVersion: '2024-01-01' as const }

type SlideMediaPickerDialogProps = {
  onClose: () => void
  onPickImage: (imageAssetId: string) => void
  onPickVideo: (muxVideoAssetId: string) => void
}

export function SlideMediaPickerDialog({
  onClose,
  onPickImage,
  onPickVideo,
}: SlideMediaPickerDialogProps) {
  const client = useClient(SANITY_CLIENT_OPTIONS)
  const builder = useMemo(() => createImageUrlBuilder(client), [client])

  const [imageRefs, setImageRefs] = useState<string[]>([])
  const [muxThumbs, setMuxThumbs] = useState<MuxAssetThumb[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFetchError(null)
    client
      .fetch<Array<{ slides?: unknown }>>(`*[_type == "project" && defined(slides)]{ slides }`)
      .then(async docs => {
        if (cancelled) return
        const imgs = assetRefsFromAllProjectSlideDocs(docs)
        setImageRefs(imgs)
        const muxIds = muxVideoAssetRefsFromAllProjectSlideDocs(docs)
        if (muxIds.length === 0) {
          setMuxThumbs([])
          return
        }
        const rows = await client.fetch<MuxAssetThumb[]>(
          `*[_type == "mux.videoAsset" && _id in $ids]{ "id": _id, playbackId }`,
          { ids: muxIds },
        )
        if (cancelled) return
        const byId = new Map(rows.map(r => [r.id, r]))
        setMuxThumbs(muxIds.map(id => byId.get(id) ?? { id, playbackId: null }))
      })
      .catch(() => {
        if (cancelled) return
        setFetchError('Could not load slide media from projects.')
        setImageRefs([])
        setMuxThumbs([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client])

  const handleImage = useCallback(
    (ref: string) => {
      onPickImage(ref)
      onClose()
    },
    [onPickImage, onClose],
  )

  const handleVideo = useCallback(
    (id: string) => {
      onPickVideo(id)
      onClose()
    },
    [onPickVideo, onClose],
  )

  let body: ReactNode
  if (loading) {
    body = (
      <Flex justify="center" padding={4}>
        <Spinner muted />
      </Flex>
    )
  } else if (fetchError) {
    body = (
      <Box padding={3}>
        <Text size={1}>{fetchError}</Text>
      </Box>
    )
  } else if (imageRefs.length === 0 && muxThumbs.length === 0) {
    body = (
      <Text muted>
        No slide images or Mux videos found yet. Add media to <strong>Project slides</strong> on
        at least one project, then reopen this picker.
      </Text>
    )
  } else {
    body = (
      <Stack space={4}>
        {imageRefs.length > 0 ? (
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Images from slides (any project)
            </Text>
            <ReferencedAssetGrid refs={imageRefs} builder={builder} onPick={handleImage} />
          </Stack>
        ) : null}
        {muxThumbs.length > 0 ? (
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Videos from slides (any project)
            </Text>
            <ReferencedMuxGrid assets={muxThumbs} onPick={handleVideo} />
          </Stack>
        ) : null}
      </Stack>
    )
  }

  return (
    <Dialog
      header="Slide media (all projects)"
      id="slide-media-picker-selected-works"
      onClose={onClose}
      width={4}
      zOffset={800}
      open
    >
      <Box padding={4}>{body}</Box>
      <Flex justify="flex-end" paddingBottom={4} paddingX={4}>
        <Button text="Close" mode="ghost" onClick={onClose} />
      </Flex>
    </Dialog>
  )
}
