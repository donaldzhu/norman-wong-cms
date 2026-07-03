import { AssetPickerField, createAssetPickerButton } from '../components/assetPicker/refMediaPickerButton'
import { mediaRefsFromProject } from './refs'

import type { AssetRef, Ref } from '../components/types/media'
import { ButtonToggleInput } from '../components/common/buttonToggleInput'
import { MediaType } from '../constants/enum'
import { defineField, type ImageRule, type Rule } from 'sanity'
import { SLIDE_FIELD_ID } from '../constants/configs'
import type { Context } from 'react'

export const createToggleButtonField = (options?: {
  name?: string
  title?: string
  required?: boolean
}) => defineField({
  name: options?.name ?? 'mediaType',
  title: options?.title,
  type: 'string',
  initialValue: MediaType.IMAGE,
  components: { input: ButtonToggleInput },
  options: {
    list: [
      { title: 'Image', value: MediaType.IMAGE },
      { title: 'Video', value: MediaType.VIDEO },
    ],
  },
  validation: rule => rule.required(),
})

export const createToggleMediaFields = (ProjectContext?: Context<Ref | undefined>) => {
  const validateValue = (
    value: unknown,
    context: { parent?: unknown; document?: unknown },
    mediaType: MediaType,
  ) => {
    const parent = context.parent as { mediaType?: MediaType } | undefined
    if (parent?.mediaType !== mediaType) return true

    const ADD_ASSET_ERROR_MESSAGE = `Add ${mediaType === MediaType.IMAGE ? 'an image' : 'a video'}.`
    if (!value) return ADD_ASSET_ERROR_MESSAGE

    const ref = (value as AssetRef).asset?._ref
    if (!ref) return ADD_ASSET_ERROR_MESSAGE

    if (ProjectContext) return true

    const doc = context.document as { [SLIDE_FIELD_ID]?: unknown } | undefined
    const allowed = mediaRefsFromProject(doc?.[SLIDE_FIELD_ID])
      .filter(ref => ref.mediaType === mediaType)
      .map(ref => ref.media.asset._ref)

    if (!allowed.includes(ref)) return `The ${mediaType} must appear within the project.`
    return true
  }

  const validateImage = (rule: ImageRule, mediaType: MediaType) =>
    rule.custom((value, context) => validateValue(value, context, mediaType))

  const validate = (rule: Rule, mediaType: MediaType) =>
    rule.custom((value, context) => validateValue(value, context, mediaType))

  return [
    createToggleButtonField(),
    defineField({
      name: MediaType.IMAGE,
      type: 'image',
      components: {
        input: createAssetPickerButton({
          mediaType: MediaType.IMAGE,
          RefContext: ProjectContext,
        }),
        field: AssetPickerField,
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.IMAGE,
      validation: rule => validateImage(rule, MediaType.IMAGE),
    }),
    defineField({
      name: MediaType.VIDEO,
      type: 'mux.video',
      components: {
        input: createAssetPickerButton({
          mediaType: MediaType.VIDEO,
          RefContext: ProjectContext,
        }),
        field: AssetPickerField,
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.VIDEO,
      validation: rule => validate(rule, MediaType.VIDEO),
    }),
  ]
}

