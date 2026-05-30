import { PreviewProps } from 'sanity'
import type { MediaData, ProjectSlideFormValue } from '../types/media'
import { PreviewTemplate } from './previewTemplate'

type ProjectDocumentPreviewProps = PreviewProps & {
  title?: string
  subtitle?: string
  slides?: ProjectSlideFormValue[]
}

export const ProjectDocumentPreview = (props: PreviewProps) => {
  const { title, subtitle, slides } = props as ProjectDocumentPreviewProps

  return (
    <PreviewTemplate
      data={slides?.[0]?.media?.[0] as MediaData | undefined}
      title={title ?? 'Untitled'}
      subtitle={subtitle}
    />
  )
}
