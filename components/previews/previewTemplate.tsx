import { MediaRefPreview, type MediaData } from './mediaRefPreview'
import { Flex, Stack, Text } from '@sanity/ui'

interface PreviewTemplateProps {
  data?: MediaData[]
  title?: string
  subtitle?: string
}

export const PreviewTemplate = ({
  data,
  title,
  subtitle,
}: PreviewTemplateProps) => {
  return (
    <Flex align="center" gap={2} paddingY={2}>
      <MediaRefPreview data={data} />
      <Stack space={2} flex={1} style={{ minWidth: 0 }} >
        <Text size={1} textOverflow="ellipsis">
          {title}
        </Text>
        <Text size={1} muted textOverflow="ellipsis">
          {subtitle}
        </Text>
      </Stack>
    </Flex>
  )
}