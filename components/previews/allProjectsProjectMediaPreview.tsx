import * as changeCase from 'change-case'

import type { AssetRef } from '../types/media'
import { HideableOnMobile } from './hideableOnMobile'
import { MediaType } from '../../constants/enum'
import { PreviewProps } from 'sanity'

type AllProjectsProjectMediaPreviewProps = PreviewProps & {
  mediaType?: MediaType
  image?: AssetRef
  video?: AssetRef
  hideOnMobile?: boolean | undefined
}

export const AllProjectsProjectMediaPreview = ({
  hideOnMobile,
  mediaType,
  ...props
}: AllProjectsProjectMediaPreviewProps) =>
  <HideableOnMobile
    data={{ ...props, mediaType: mediaType ?? MediaType.IMAGE }}
    title={changeCase.capitalCase(mediaType ?? 'Unknown')}
    hideOnMobile={hideOnMobile} />
