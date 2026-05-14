import { ErrorOutlineIcon } from '@sanity/icons'
import { Box, Card, Flex } from '@sanity/ui'
import { PreviewProps } from 'sanity'

import type { MediaData } from '../types/media'
import { PreviewTemplate } from './previewTemplate'

type ProjectDocumentPreviewProps = PreviewProps & {
  title?: string
  subtitle?: string
  slideThumb?: MediaData
  hasGridIssue?: boolean
}

export const ProjectDocumentPreview = (props: PreviewProps) => {
  const { title, subtitle, slideThumb, hasGridIssue } = props as ProjectDocumentPreviewProps

  return (
    <Card
      tone={hasGridIssue ? 'critical' : 'transparent'}
      padding={2}
      radius={2}
      border={Boolean(hasGridIssue)}
    >
      <Flex align="center" gap={2}>
        {hasGridIssue ? (
          <Box flex="none" style={{ color: 'var(--card-badge-critical-icon-color)' }}>
            <ErrorOutlineIcon />
          </Box>
        ) : null}
        <Box flex={1} style={{ minWidth: 0 }}>
          <PreviewTemplate
            data={slideThumb}
            title={title ?? 'Untitled'}
            subtitle={hasGridIssue ? 'Slide grid incomplete' : subtitle}
          />
        </Box>
      </Flex>
    </Card>
  )
}
