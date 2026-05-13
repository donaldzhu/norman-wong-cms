import { AssetPickerField, createAssetPickerButton } from '../../../components/assetPicker/refMediaPickerButton'
import { MediaType, Size } from '../../../constants/enum'
import { defineField, defineType } from 'sanity'
import { muxVideoAssetRefsFromProject, toRemove_assetRefsFromProject } from '../../../utils/refs'

import { AllProjectSlidePreview } from '../../../components/previews/allProjectsThumbnailPreview'
import { ButtonToggleInput } from '../../../components/common/buttonToggleInput'
import { DocumentIcon } from '@sanity/icons'

const SLIDES_FIELD_ID = 'slides'

const SIZE_FIELDSET = 'sizes'
export const allProjectsThumbnail = defineType({
  name: 'allProjectsThumbnail',
  title: 'Image or file',
  type: 'object',
  components: { preview: AllProjectSlidePreview },
  fieldsets: [
    {
      name: SIZE_FIELDSET,
      title: 'Size Settings',
      options: { columns: 2 }
    },
  ],
  fields: [
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
          fieldId: SLIDES_FIELD_ID,
          mediaType: MediaType.IMAGE,
        }),
        field: AssetPickerField,
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.IMAGE,
      validation: rule =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== MediaType.IMAGE) return true
          if (!value) return 'Add an image'
          const img = value as { asset?: { _ref?: string } }
          const ref = img?.asset?._ref
          if (!ref) return 'Add an image'
          const doc = context.document as { slides?: unknown } | undefined
          const allowed = new Set(toRemove_assetRefsFromProject(doc?.slides))
          if (!allowed.has(ref)) {
            return 'The image thumbnail must appear within the project.'
          }
          return true
        }),
    }),
    defineField({
      name: MediaType.VIDEO,
      type: 'mux.video',
      components: {
        input: createAssetPickerButton({
          fieldId: SLIDES_FIELD_ID,
          mediaType: MediaType.VIDEO,
        }),
        field: AssetPickerField,
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.VIDEO,
      validation: rule =>
        rule.custom(async (value: unknown, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== MediaType.VIDEO) return true
          const mux = value as { asset?: { _ref?: string } } | null | undefined
          if (!mux?.asset?._ref) return 'Add a video'
          const doc = context.document as { slides?: unknown } | undefined
          const allowed = new Set(muxVideoAssetRefsFromProject(doc?.slides))
          if (!allowed.has(mux.asset._ref))
            return 'The video thumbnail must appear within the project.'

          return true
        }),
    }),
    defineField({
      name: 'desktopSize',
      title: 'Desktop',
      type: 'string',
      initialValue: Size.S,
      fieldset: SIZE_FIELDSET,
      options: {
        list: [
          { title: 'S', value: Size.S },
          { title: 'M', value: Size.M },
          { title: 'L', value: Size.L },
        ],
      },
      components: { input: ButtonToggleInput },
    }),
    defineField({
      name: 'mobileSize',
      title: 'Mobile',
      type: 'string',
      initialValue: Size.S,
      fieldset: SIZE_FIELDSET,
      options: {
        list: [
          { title: 'S', value: Size.S },
          { title: 'L', value: Size.L },
        ],
      },
      components: { input: ButtonToggleInput },
    }),
    defineField({
      name: 'hideOnMobile',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: MediaType.IMAGE,
      video: MediaType.VIDEO,
      desktopSize: 'desktopSize',
      mobileSize: 'mobileSize',
    }
  },
})
