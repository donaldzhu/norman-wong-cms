import { MediaType } from '../../constants/enum'

export interface Ref {
  _ref?: string
}

export interface AssetRef {
  asset?: Ref
}

export interface ValidAssetRef {
  asset: Required<Ref>
}

export interface MediaRef {
  mediaType?: MediaType
  media?: AssetRef
}

export interface ValidMediaRef {
  mediaType: MediaType
  media: ValidAssetRef
}

export interface MediaData {
  mediaType: MediaType
  image?: AssetRef
  video?: AssetRef
}

/** `projectSlide.media[]` item fields used by the slide grid planner. */
export type ProjectSlideGridValue = {
  _key: string
  mediaType?: MediaType
  image?: AssetRef
  video?: AssetRef
  desktopStart?: number
  desktopEnd?: number
  mobileStart?: number
  mobileEnd?: number
}

/** `projectSlide` object fields used by the slide grid planner. */
export type ProjectSlideFormValue = {
  automaticMobileLayout?: boolean
  mobileOrientation?: string
  media?: ProjectSlideGridValue[]
  description?: string
  year?: number
}