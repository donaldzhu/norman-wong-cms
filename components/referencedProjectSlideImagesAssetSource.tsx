import { ImagesIcon } from '@sanity/icons'
import createImageUrlBuilder from '@sanity/image-url'
import { Box, Button, Card, Dialog, Flex, Grid, Spinner, Stack, Text } from '@sanity/ui'
import { useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AssetSourceComponentProps } from 'sanity'
import { useClient, useFormBuilder, useGetFormValue } from 'sanity'

import { SelectedWorksThumbnailSectionPathContext } from './selectedWorksThumbnailImageInput'
import {
  type FormPathSegment,
  publishedAndDraftIdsFromRef,
  selectedWorksSectionPathFromFieldPath,
} from '../utils/selectedWorksSectionPath'
import { assetRefsFromProject } from '../utils/refs'

type FormBuilderWithFocus = {
  focusPath?: readonly FormPathSegment[]
}

function ReferencedProjectSlideImagesPicker(props: AssetSourceComponentProps) {
  const { onClose, onSelect } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const builder = useMemo(() => createImageUrlBuilder(client), [client])
  const getFormValue = useGetFormValue()
  const formBuilder = useFormBuilder() as FormBuilderWithFocus
  const focusPath = formBuilder.focusPath ?? []
  const sectionPathFromContext = useContext(SelectedWorksThumbnailSectionPathContext)

  const sectionPath = useMemo(() => {
    if (sectionPathFromContext?.length) return sectionPathFromContext
    return selectedWorksSectionPathFromFieldPath(focusPath)
  }, [sectionPathFromContext, focusPath])

  const projectRef = useMemo(() => {
    if (!sectionPath?.length) return undefined
    const project = getFormValue([...sectionPath, 'project']) as { _ref?: string } | undefined
    return project?._ref
  }, [getFormValue, sectionPath])

  const [refs, setRefs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectRef) {
      setRefs([])
      setFetchError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setFetchError(null)
    const ids = publishedAndDraftIdsFromRef(projectRef)
    client
      .fetch<unknown>(`*[_id in $ids][0].slides`, { ids })
      .then(slides => {
        if (cancelled) return
        setRefs(assetRefsFromProject(slides))
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
  }, [client, projectRef])

  const handlePick = useCallback(
    (ref: string) => {
      onSelect([{ kind: 'assetDocumentId' as const, value: ref }])
    },
    [onSelect],
  )

  let body: ReactNode
  if (!sectionPath?.length) {
    body = (
      <Text muted>
        Could not resolve this thumbnail’s section in the form. Close the dialog, click into the
        image field again, then choose <strong>Slide images (project)</strong>.
      </Text>
    )
  } else if (!projectRef) {
    body = (
      <Text muted>
        Select a <strong>project</strong> for this section first.
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
      <Card padding={3} radius={2} tone="critical">
        <Text size={1}>{fetchError}</Text>
      </Card>
    )
  } else if (refs.length === 0) {
    body = (
      <Stack space={3}>
        <Text muted>
          This project has no qualifying images yet. Add at least one <strong>image</strong> (not
          only files) to <strong>Project slides</strong> on that project, then reopen this picker.
        </Text>
        <Text muted size={1}>
          Listed assets are image documents referenced from slide media rows only.
        </Text>
      </Stack>
    )
  } else {
    body = (
      <Stack space={3}>
        <Text muted size={1}>
          Only images already used on this project’s slides (slide → media → image).
        </Text>
        <Grid columns={[2, 2, 3, 4]} gap={3}>
          {refs.map(ref => (
            <Card
              key={ref}
              as="button"
              type="button"
              padding={2}
              radius={2}
              tone="default"
              style={{
                cursor: 'pointer',
                border: '1px solid var(--card-border-color)',
                overflow: 'hidden',
              }}
              onClick={() => handlePick(ref)}
            >
              <img
                alt=""
                src={builder
                  .image({ asset: { _type: 'reference', _ref: ref } })
                  .width(320)
                  .height(320)
                  .fit('max')
                  .url()}
                style={{ display: 'block', width: '100%', height: 'auto', verticalAlign: 'top' }}
              />
            </Card>
          ))}
        </Grid>
      </Stack>
    )
  }

  return (
    <Dialog
      header="Slide images for this project"
      id="referenced-project-slide-images"
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

export const referencedProjectSlideImagesAssetSource = {
  name: 'referenced-project-slide-images',
  title: 'Slide images (project)',
  component: ReferencedProjectSlideImagesPicker,
  icon: ImagesIcon,
}
