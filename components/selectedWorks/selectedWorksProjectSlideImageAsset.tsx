import { ImagesIcon } from '@sanity/icons'
import createImageUrlBuilder from '@sanity/image-url'
import { Box, Button, Dialog, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AssetSourceComponentProps } from 'sanity'
import { useClient, useFormValue } from 'sanity'

import { toRemove_assetRefsFromProject, projectDocumentIdsForQuery } from '../../utils/refs'

import { SANITY_CLIENT_OPTIONS } from '../../constants/configs'
import { ReferencedImageGrid } from '../assetPicker/_referencedImageGrid'
import { useSelectedWorksProjectRef } from './selectedWorksProjectContext'


const SelectedWorksProjectSlideImagePicker = (props: AssetSourceComponentProps) => {
  const { onClose, onSelect } = props
  const projectRef = useSelectedWorksProjectRef()
  const projectId = projectRef?._ref
  const client = useClient(SANITY_CLIENT_OPTIONS)
  const builder = useMemo(() => createImageUrlBuilder(client), [client])

  const [refs, setRefs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setRefs([])
      setLoading(false)
      setFetchError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setFetchError(null)
    client
      .fetch<{ slides?: unknown } | null>(
        `*[_type == "project" && _id in $ids][0]{ slides }`,
        { ids: projectDocumentIdsForQuery(projectId) },
      )
      .then(doc => {
        if (cancelled) return
        setRefs(toRemove_assetRefsFromProject(doc?.slides))
      })
      .catch(() => {
        if (cancelled) return
        setFetchError('Could not load slides for this project.')
        setRefs([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client, projectId])

  const handlePick = useCallback(
    (ref: string) => {
      onSelect([{ kind: 'assetDocumentId' as const, value: ref }])
    },
    [onSelect],
  )

  let body: ReactNode
  if (!projectId) {
    body = (
      <Text muted>
        Choose a <strong>Project</strong> on this block first. Only slide images from that project can
        be used here.
      </Text>
    )
  } else if (loading) {
    body = (
      <Flex justify="center" padding={4}>
        <Spinner muted />
      </Flex>
    )
  } else if (fetchError) {
    body = (
      <Text size={1} muted>
        {fetchError}
      </Text>
    )
  } else if (refs.length === 0) {
    body = (
      <Stack space={3}>
        <Text muted>
          No slide images on this project yet. Add images to <strong>Project slides</strong> on that
          project, then reopen this picker.
        </Text>
      </Stack>
    )
  } else {
    body = (
      <Stack space={3}>
        <Text muted size={1}>
          Images from this project’s slides only.
        </Text>
        <ReferencedImageGrid refs={refs} builder={builder} onPick={handlePick} />
      </Stack>
    )
  }

  return (
    <Dialog
      header="Slide images (this project)"
      id="selected-works-project-slide-images"
      onClose={onClose}
      width={4}
      zOffset={900}
      open
    >
      <Box padding={4}>{body}</Box>
      <Flex justify="flex-end" paddingBottom={4} paddingX={4}>
        <Button text="Close" mode="ghost" onClick={onClose} />
      </Flex>
    </Dialog>
  )
}

export const selectedWorksProjectSlideImageAsset = {
  name: 'selected-works-project-slide-images',
  component: SelectedWorksProjectSlideImagePicker,
  icon: ImagesIcon,
}
