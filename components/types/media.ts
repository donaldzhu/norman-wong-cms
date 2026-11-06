import type { SlideLayoutV2 } from '../../utils/projectSlideV2'
import { MediaType } from '../../constants/enum'

export interface Ref {
  _ref?: string
}

export interface AssetRef {
  asset?: Ref
}

export interface MediaRef {
  mediaType?: MediaType
  media?: AssetRef
}

export interface ValidMediaRef {
  mediaType: MediaType
  media: {
    asset: Required<Ref>
  }
}

export interface MediaData {
  mediaType: MediaType
  image?: AssetRef
  video?: AssetRef
}

export interface ProjectSlideGridValue {
  _key: string
  mediaType?: MediaType
  image?: AssetRef
  video?: AssetRef
  mobileMediaType?: MediaType
  mobileImage?: AssetRef
  mobileVideo?: AssetRef
  desktopSpan?: number
  mobileSpan?: number
  desktopStart?: number
  desktopEnd?: number
  mobileStart?: number
  mobileEnd?: number
}

export interface ProjectSlideFormValue {
  layoutV2?: SlideLayoutV2
  mobileOrientation?: string
  media?: ProjectSlideGridValue[]
}