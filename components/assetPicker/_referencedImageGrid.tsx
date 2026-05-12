import { Card, Grid } from '@sanity/ui'

import type { ImageUrlBuilder } from '@sanity/image-url'

type ReferencedImageGridProps = {
  refs: string[]
  builder: ImageUrlBuilder
  onPick: (ref: string) => void
}

export const ReferencedImageGrid = ({ refs, builder, onPick }: ReferencedImageGridProps) =>
  <Grid columns={[3, 3, 4, 5]} gap={3}>
    {refs.map(ref => (
      <Card
        key={ref}
        as="button"
        type="button"
        padding={2}
        radius={2}
        style={{
          cursor: 'pointer',
          border: '1px solid var(--card-border-color)',
          overflow: 'hidden',
        }}
        onClick={() => onPick(ref)}
      >
        <img
          alt=""
          src={builder
            .image({ asset: { _type: 'reference', _ref: ref } })
            .width(320)
            .height(320)
            .fit('max')
            .url()}
          style={{ display: 'block', width: '100%', height: 'auto', verticalAlign: 'middle' }}
        />
      </Card>
    ))}
  </Grid>

