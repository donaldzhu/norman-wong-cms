import { Badge, Card, Flex } from '@sanity/ui'

import type { MediaData } from '../types/media'
import { PreviewTemplate } from './previewTemplate'

export const HideableOnMobile = ({ data, title, subtitle, hideOnMobile }: {
  data?: MediaData,
  title?: string,
  subtitle?: string,
  hideOnMobile?: boolean
}) => (
  <Card paddingRight={2}>
    <Flex align="center">
      <Flex flex={1} style={{ minWidth: 0 }}>
        <PreviewTemplate data={data} title={title} subtitle={subtitle} />
      </Flex>
      {hideOnMobile && (
        <Badge tone="neutral">
          Hidden on Mobile
        </Badge>
      )}
    </Flex>
  </Card>
)