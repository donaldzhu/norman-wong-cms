import { Card, Grid } from '@sanity/ui'
import type { ImageUrlBuilder } from '@sanity/image-url'

type ReferencedAssetGridProps = {
  /** Sanity image-asset document IDs from slide media */
  refs: string[]
  builder: ImageUrlBuilder
  onPick: (ref: string) => void
}

export function ReferencedAssetGrid({ refs, builder, onPick }: ReferencedAssetGridProps) {
  return (
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
            style={{ display: 'block', width: '100%', height: 'auto', verticalAlign: 'top' }}
          />
        </Card>
      ))}
    </Grid>
  )
}
