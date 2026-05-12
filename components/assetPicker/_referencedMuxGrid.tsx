import { Card, Grid, Text } from '@sanity/ui'

export type MuxAssetThumb = { id: string; playbackId: string | null }

type ReferencedMuxGridProps = {
  assets: MuxAssetThumb[]
  onPick: (muxVideoAssetId: string) => void
}

export function ReferencedMuxGrid({ assets, onPick }: ReferencedMuxGridProps) {
  return (
    <Grid columns={[2, 2, 3, 4]} gap={3}>
      {assets.map(({ id, playbackId }) => (
        <Card
          key={id}
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
          onClick={() => onPick(id)}
        >
          {playbackId ? (
            <img
              alt=""
              src={`https://image.mux.com/${playbackId}/thumbnail.jpg?width=320&height=320&fit_mode=smartcrop`}
              style={{ display: 'block', width: '100%', height: 'auto', verticalAlign: 'top' }}
            />
          ) : (
            <Text muted size={1}>
              Video (no preview)
            </Text>
          )}
        </Card>
      ))}
    </Grid>
  )
}
