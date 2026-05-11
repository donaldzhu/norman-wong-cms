import { Flex, Stack, Text } from '@sanity/ui'
import { PreviewProps } from 'sanity'
import { MediaRefPreview, type MediaData } from './mediaRefPreview'


type ProjectSlidePreviewProps = PreviewProps & {
  description?: string
  year?: number
  slideMedia?: MediaData[]
}

const countMedia = (rows: MediaData[]) => {
  const counter = []
  const imageCounter = rows.filter(r => r.mediaType === 'image').length
  const videoCounter = rows.filter(r => r.mediaType === 'video').length
  if (imageCounter) counter.push(`${imageCounter} images`)
  if (videoCounter) counter.push(`${videoCounter} videos`)
  return counter.length ? counter.join(' · ') : 'No media'
}


export const ProjectSlidePreview = (props: PreviewProps) => {
  const {
    description,
    year,
    slideMedia
  } = props as ProjectSlidePreviewProps

  const titleParts: string[] = []
  if (description) titleParts.push(description)
  if (year != null) titleParts.push(String(year))
  const title = titleParts.length ? titleParts.join(' · ') : 'Untitled'

  return (
    <Flex align="center" gap={2} paddingY={2}>
      <MediaRefPreview data={slideMedia} />
      <Stack space={2} flex={1} style={{ minWidth: 0 }} >
        <Text size={1} weight="semibold" textOverflow="ellipsis">
          {title}
        </Text>
        <Text size={1} muted textOverflow="ellipsis">
          {countMedia(slideMedia ?? [])}
        </Text>
      </Stack>
    </Flex>
  )
}
