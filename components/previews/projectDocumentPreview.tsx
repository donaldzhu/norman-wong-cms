import { Box, Card } from '@sanity/ui'

import type { MediaData } from '../types/media'
import { PreviewProps } from 'sanity'
import { PreviewTemplate } from './previewTemplate'

type ProjectDocumentPreviewProps = PreviewProps & {
  title?: string
  subtitle?: string
  slides?: MediaData[]
}

export const ProjectDocumentPreview = (props: PreviewProps) => {
  const { title, subtitle, slides, } = props as ProjectDocumentPreviewProps

  return (
    <Card
      padding={2}
      radius={2}
    >
      <Box flex={1} style={{ minWidth: 0 }}>
        <PreviewTemplate
          data={slides?.[0]}
          title={title ?? 'Untitled'}
          subtitle={subtitle}
        />
      </Box>
    </Card>
  )
}
