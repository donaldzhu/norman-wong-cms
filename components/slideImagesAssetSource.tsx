import { Box, Button, Card, Dialog, Flex, Grid, Text } from '@sanity/ui'
import { useCallback, useMemo } from 'react'
import { useClient, useFormValue } from 'sanity'

import type { AssetSourceComponentProps } from 'sanity'
import { ImagesIcon } from '@sanity/icons'
import { assetRefsFromProject } from '../utils/refs'
import createImageUrlBuilder from '@sanity/image-url'

const SlideImagesAssetPicker = (props: AssetSourceComponentProps) => {
  const { onSelect, onClose } = props
  const slides = useFormValue(['slides'])
  const client = useClient({ apiVersion: '2026-04-26' })
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
        )}
        <Flex justify="flex-end" marginTop={4}>
          <Button text="Close" mode="ghost" onClick={onClose} />
        </Flex>
      </Box>
    </Dialog>
  )
}

export const slideImagesAssetSource = {
  name: 'slide-images',
  title: 'Slide images',
  component: SlideImagesAssetPicker,
  icon: ImagesIcon,
}
