import { Card, Grid } from '@sanity/ui'
import type { MediaRef, ValidMediaRef } from '../types/media'

import { MediaRefPreview } from '../previews/mediaRefPreview'
import { MediaType } from '../../constants/enum'
import { isValidMediaRef } from '../../utils/refs'

interface RefMediaPickerGridProps {
  refs: MediaRef[]
  onPick: (ref: string) => void
  mediaType: MediaType
}

const THUMBNAIL_SIZE = 320

export const RefMediaPickerGrid = ({ refs: _refs, onPick, mediaType }: RefMediaPickerGridProps) => {
  const refs: ValidMediaRef[] = _refs.filter(isValidMediaRef)
    .filter(ref => ref.mediaType === mediaType)
  return (
    <Grid columns={[4, 4, 5, 6]} gap={2}>
      {refs.map(ref => (
        <Card
          key={ref.media?.asset?._ref}
          as="button"
          type="button"
          padding={2}
          radius={2}
          style={{
            cursor: 'pointer',
            border: '1px solid var(--card-border-color)',
            overflow: 'hidden',
            aspectRatio: '1',
          }}
          onClick={() => onPick(ref.media?.asset?._ref)}
        >
          <MediaRefPreview
            mediaWithRef={ref.media}
            mediaType={mediaType}
            sanityImageWidth={THUMBNAIL_SIZE}
            showSpinner
          />
        </Card>
      ))}
    </Grid>
  )
}