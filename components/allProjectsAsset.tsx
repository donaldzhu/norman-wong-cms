import { Box, Button, Dialog, Flex, Text } from '@sanity/ui'
import { useCallback, useMemo } from 'react'
import { useClient, useFormValue } from 'sanity'

import type { AssetSourceComponentProps } from 'sanity'
import { ImagesIcon } from '@sanity/icons'
import { ReferencedAssetGrid } from './referencedAssetGrid'
import { assetRefsFromProject } from '../utils/refs'
import createImageUrlBuilder from '@sanity/image-url'

/** Stable reference — inline `{ apiVersion }` changes every render and can make `useClient` unstable. */
const SANITY_CLIENT_OPTIONS = { apiVersion: '2026-04-26' as const }

const AllProjectsAssetPicker = (props: AssetSourceComponentProps) => {
  const { onSelect, onClose } = props
  const slides = useFormValue(['slides'])
  const client = useClient(SANITY_CLIENT_OPTIONS)
  const builder = useMemo(() => createImageUrlBuilder(client), [client])
  const refs = useMemo(() => assetRefsFromProject(slides), [slides])

  const handlePick = useCallback(
    (ref: string) => onSelect([{ kind: 'assetDocumentId' as const, value: ref }]),
    [onSelect],
  )

  return (
    <Dialog
      id="slide-images-asset-source"
      header="Choose from slide images"
      onClose={onClose}
      width={4}
      zOffset={800}
      open
    >
      <Box padding={4}>
        {refs.length === 0 ? (
          <Text muted>
            Add at least one image to <strong>Project slides</strong> on this document first.
            Only those images can be used here.
          </Text>
        ) : (
          <ReferencedAssetGrid refs={refs} builder={builder} onPick={handlePick} />
        )}
        <Flex justify="flex-end" marginTop={4}>
          <Button text="Close" mode="ghost" onClick={onClose} />
        </Flex>
      </Box>
    </Dialog>
  )
}

export const allProjectsAssetSource = {
  name: 'all-projects-assets',
  component: AllProjectsAssetPicker,
  icon: ImagesIcon,
}
