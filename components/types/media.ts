import { MediaType } from '../../constants/enum'

export interface AssetRef {
  asset?: { _ref?: string }
}

export interface ValidAssetRef {
  asset: { _ref: string }
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