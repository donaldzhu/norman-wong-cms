import { AssetPickerField, createAssetPickerButton } from '../components/assetPicker/refMediaPickerButton'
import { mediaRefsFromProject } from './refs'

import type { AssetRef } from '../components/types/media'
import { ButtonToggleInput } from '../components/common/buttonToggleInput'
import { MediaType } from '../constants/enum'
import { defineField, type ImageRule, type Rule } from 'sanity'

interface CreateToggleMediaFieldsProps {
  fieldId: string
}

export const createToggleMediaFields = ({ fieldId }: CreateToggleMediaFieldsProps) => {
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

    const doc = context.document as { [fieldId]?: unknown } | undefined
    const allowed = mediaRefsFromProject(doc?.[fieldId])
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
    defineField({
      name: 'mediaType',
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
    }),
    defineField({
      name: MediaType.IMAGE,
      type: 'image',
      components: {
        input: createAssetPickerButton({
          fieldId,
          mediaType: MediaType.IMAGE,
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
          fieldId: fieldId,
          mediaType: MediaType.VIDEO,
        }),
        field: AssetPickerField,
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.VIDEO,
      validation: rule => validate(rule, MediaType.VIDEO),
    }),
  ]
}

