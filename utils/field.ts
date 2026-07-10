import { AssetPickerField, createAssetPickerButton } from '../components/assetPicker/refMediaPickerButton'

import type { Ref } from '../components/types/media'
import { ButtonToggleInput } from '../components/common/buttonToggleInput'
import { MediaType } from '../constants/enum'
import { defineField, type ImageRule, type Rule } from 'sanity'
import type { Context } from 'react'
import { ImageFieldWrapper } from '../components/common/imageFIeldWrapper'

export const createToggleButtonField = (options?: {
  name?: string
  title?: string
  required?: boolean
  hidden?: (context: { parent?: unknown }) => boolean
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
  hidden: options?.hidden,
})

const validateValue = (
  value: unknown,
  context: { parent?: unknown; document?: unknown },
  mediaType: MediaType,
  ProjectContext?: Context<Ref | undefined>,
) => {
  const parent = context.parent as { mediaType?: MediaType } | undefined
  if (parent?.mediaType !== mediaType) return true

  const ADD_ASSET_ERROR_MESSAGE = `Add ${mediaType === MediaType.IMAGE ? 'an image' : 'a video'}.`
  if (!value) return ADD_ASSET_ERROR_MESSAGE

  /* const ref = (value as AssetRef).asset?._ref
  if (!ref) return ADD_ASSET_ERROR_MESSAGE

  if (ProjectContext) return true

  const doc = context.document as { [SLIDE_FIELD_ID]?: unknown } | undefined
  const allowed = mediaRefsFromProject(doc?.[SLIDE_FIELD_ID])
    .filter(ref => ref.mediaType === mediaType)
    .map(ref => ref.media.asset._ref)

  if (!allowed.includes(ref)) return `The ${mediaType} must appear within the project.` */
  return true
}

export const validateImage = (rule: ImageRule, mediaType: MediaType, ProjectContext?: Context<Ref | undefined>) =>
  rule.custom((value, context) => validateValue(value, context, mediaType, ProjectContext))

export const validateVideo = (rule: Rule, mediaType: MediaType, ProjectContext?: Context<Ref | undefined>) =>
  rule.custom((value, context) => validateValue(value, context, mediaType, ProjectContext))

interface CreateToggleMediaFieldsProps {
  context?: Context<Ref | undefined>
  limitToProject?: boolean
}
export const createToggleMediaFields = ({
  context: ProjectContext,
  limitToProject = true,
}: CreateToggleMediaFieldsProps = {}) => {
  return [
    createToggleButtonField(),
    defineField({
      name: MediaType.IMAGE,
      type: 'image',
      components: {
        input: limitToProject ? createAssetPickerButton({
          mediaType: MediaType.IMAGE,
          RefContext: ProjectContext,
        }) : ImageFieldWrapper,
        field: AssetPickerField,
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.IMAGE,
      validation: rule => validateImage(rule, MediaType.IMAGE, ProjectContext),
    }),
    defineField({
      name: MediaType.VIDEO,
      type: 'mux.video',
      /* components: {
        input: limitToProject ? createAssetPickerButton({
          mediaType: MediaType.VIDEO,
          RefContext: ProjectContext,
        }) : undefined,
        field: AssetPickerField,
      }, */
      hidden: ({ parent }) => parent?.mediaType !== MediaType.VIDEO,
      validation: rule => validateVideo(rule, MediaType.VIDEO, ProjectContext),
    }),
  ]
}

