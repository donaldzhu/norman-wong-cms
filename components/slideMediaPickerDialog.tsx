import createImageUrlBuilder from '@sanity/image-url'
import { Box, Button, Dialog, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useClient } from 'sanity'

import { ReferencedAssetGrid } from './referencedAssetGrid'
import { ReferencedMuxGrid, type MuxAssetThumb } from './referencedMuxGrid'
import {
  assetRefsFromAllProjectSlideDocs,
  assetRefsFromProject,
  muxVideoAssetRefsFromAllProjectSlideDocs,
  muxVideoAssetRefsFromProject,
  projectDocumentIdsForQuery,
} from '../utils/refs'

/** Stable reference — inline `{ apiVersion }` changes every render and can make `useClient` unstable. */
const SANITY_CLIENT_OPTIONS = { apiVersion: '2024-01-01' as const }

export type SlideMediaPickerMode = 'both' | 'image' | 'video'

type SlideMediaPickerDialogProps = {
  onClose: () => void
  onPickImage: (imageAssetId: string) => void
  onPickVideo: (muxVideoAssetId: string) => void
  /** Raise when stacking above another dialog (e.g. project block editor). */
  zOffset?: number
  /** When set, only slide media from this project document is listed. */
  projectId?: string
  /** Limit which sections render (default both). */
  mode?: SlideMediaPickerMode
}

export function SlideMediaPickerDialog({
  onClose,
  onPickImage,
  onPickVideo,
  zOffset = 800,
  projectId,
  mode = 'both',
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

    const run = async () => {
      try {
        if (projectId) {
          const doc = await client.fetch<{ slides?: unknown } | null>(
            `*[_type == "project" && _id in $ids][0]{ slides }`,
            { ids: projectDocumentIdsForQuery(projectId) },
          )
          if (cancelled) return
          const slides = doc?.slides
          const imgs = assetRefsFromProject(slides)
          setImageRefs(imgs)
          const muxIds = muxVideoAssetRefsFromProject(slides)
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
        } else {
          const docs = await client.fetch<Array<{ slides?: unknown }>>(
            `*[_type == "project" && defined(slides)]{ slides }`,
          )
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
        }
      } catch {
        if (cancelled) return
        setFetchError('Could not load slide media.')
        setImageRefs([])
        setMuxThumbs([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [client, projectId])

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

  const showImages = mode === 'both' || mode === 'image'
  const showVideos = mode === 'both' || mode === 'video'

  const header = projectId ? 'Slide media (this project)' : 'Slide media (all projects)'

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
  } else if (
    !(showImages && imageRefs.length > 0) &&
    !(showVideos && muxThumbs.length > 0)
  ) {
    body = (
      <Text muted>
        {projectId ? (
          <>
            No qualifying slide media on this project yet. Add images or videos to{' '}
            <strong>Project slides</strong> on that project, then reopen this picker.
          </>
        ) : (
          <>
            No slide images or Mux videos found yet. Add media to <strong>Project slides</strong> on
            at least one project, then reopen this picker.
          </>
        )}
      </Text>
    )
  } else {
    body = (
      <Stack space={4}>
        {showImages && imageRefs.length > 0 ? (
          <Stack space={2}>
            <Text size={1} weight="semibold">
              {projectId ? 'Images from this project’s slides' : 'Images from slides (any project)'}
            </Text>
            <ReferencedAssetGrid refs={imageRefs} builder={builder} onPick={handleImage} />
          </Stack>
        ) : null}
        {showVideos && muxThumbs.length > 0 ? (
          <Stack space={2}>
            <Text size={1} weight="semibold">
              {projectId ? 'Videos from this project’s slides' : 'Videos from slides (any project)'}
            </Text>
            <ReferencedMuxGrid assets={muxThumbs} onPick={handleVideo} />
          </Stack>
        ) : null}
      </Stack>
    )
  }

  return (
    <Dialog
      header={header}
      id={projectId ? 'slide-media-picker-one-project' : 'slide-media-picker-all-projects'}
      onClose={onClose}
      width={4}
      zOffset={zOffset}
      open
    >
      <Box padding={4}>{body}</Box>
      <Flex justify="flex-end" paddingBottom={4} paddingX={4}>
        <Button text="Close" mode="ghost" onClick={onClose} />
      </Flex>
    </Dialog>
  )
}
