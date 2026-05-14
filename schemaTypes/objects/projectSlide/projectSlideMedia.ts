import {
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from '../../../utils/columnRange'
import { MediaType, Orientation } from '../../../constants/enum'
import { defineField, defineType } from 'sanity'

import { ImageFieldWrapper } from '../../../components/common/imageFIeldWrapper'
import { ProjectSlideMediaObjectInput } from '../../../components/projectSlide/projectSlideMediaObjectInput'
import { ProjectSlidePreview } from '../../../components/previews/projectSlidePreview'
import { ProjectsIcon } from '@sanity/icons'
import { createToggleButtonField } from '../../../utils/field'
import { mediaAssetSource } from 'sanity-plugin-media'

const hiddenNumberField = {
  input: () => null,
  field: () => null,
}

const getMobileCellCount = (
  parent: { mobileOrientation?: unknown } | undefined,
): number =>
  parent?.mobileOrientation === 'landscape'
    ? MOBILE_LANDSCAPE_COLUMN_COUNT
    : MOBILE_PORTRAIT_ROW_COUNT

export const projectSlideMedia = defineType({
  name: 'projectSlideMedia',
  type: 'object',
  icon: ProjectsIcon,
  components: {
    input: ProjectSlideMediaObjectInput,
    preview: ProjectSlidePreview,
  },
  fields: [
    createToggleButtonField(),
    defineField({
      name: MediaType.IMAGE,
      type: 'image',
      options: {
        sources: [mediaAssetSource],
      },
      hidden: ({ parent }) => parent?.mediaType !== MediaType.IMAGE,
      components: {
        input: ImageFieldWrapper,
      },
      // TODO: validate
    }),
    defineField({
      name: MediaType.VIDEO,
      type: 'mux.video',
      hidden: ({ parent }) => parent?.mediaType !== MediaType.VIDEO,
    }),
    defineField({
      name: 'desktopStart',
      title: 'Desktop Start Column',
      type: 'number',
      initialValue: 11,
      validation: rule => rule.required().integer().min(1).max(24),
      components: hiddenNumberField,
    }),
    defineField({
      name: 'desktopEnd',
      title: 'Desktop End Column',
      type: 'number',
      initialValue: 15,
      validation: rule =>
        rule
          .required()
          .integer()
          .min(2)
          .max(25)
          .custom((end, context) => {
            const s = (context.parent as { desktopStart?: unknown } | undefined)?.desktopStart
            if (typeof end !== 'number' || typeof s !== 'number') return true
            if (end <= s) return 'End edge must be after start'
            return true
          }),
      components: hiddenNumberField,
    }),
    defineField({
      name: 'automaticMobileLayout',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'mobileOrientation',
      title: 'Mobile Orientation',
      type: 'string',
      initialValue: Orientation.PORTRAIT,
      options: {
        layout: 'dropdown',
        list: [
          { title: 'Portrait', value: Orientation.PORTRAIT },
          { title: 'Landscape', value: Orientation.LANDSCAPE },
        ],
      },
      validation: rule => rule.required(),
      hidden: ({ parent }) => parent?.automaticMobileLayout,
    }),
    defineField({
      name: 'mobileStart',
      title: 'Mobile Start Edge',
      type: 'number',
      initialValue: 11,
      validation: rule =>
        rule.custom((val, context) => {
          const parent = context.parent as {
            automaticMobileLayout?: boolean
            mobileOrientation?: unknown
          } | undefined
          if (parent?.automaticMobileLayout) return true
          if (val == null) return 'Required when custom mobile layout is off'
          if (typeof val !== 'number' || !Number.isInteger(val)) return 'Must be an integer'
          const max = getMobileCellCount(parent)
          if (val < 1 || val > max) return `Must be between 1 and ${max}`
          return true
        }),
      hidden: ({ parent }) => parent?.automaticMobileLayout,
      components: hiddenNumberField,
    }),
    defineField({
      name: 'mobileEnd',
      title: 'Mobile End Edge',
      type: 'number',
      initialValue: 15,
      validation: rule =>
        rule.custom((end, context) => {
          const parent = context.parent as {
            automaticMobileLayout?: boolean
            mobileOrientation?: unknown
            mobileStart?: unknown
          } | undefined
          if (parent?.automaticMobileLayout) return true
          if (end == null) return 'Required when custom mobile layout is off'
          if (typeof end !== 'number' || !Number.isInteger(end)) return 'Must be an integer'
          const max = getMobileCellCount(parent) + 1
          if (end < 2 || end > max) return `Must be between 2 and ${max}`
          const s = parent?.mobileStart
          if (typeof s === 'number' && end <= s) return 'End edge must be after start'
          return true
        }),
      hidden: ({ parent }) => parent?.automaticMobileLayout,
      components: hiddenNumberField,
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: 'image',
      video: 'video',
      desktopStart: 'desktopStart',
      desktopEnd: 'desktopEnd',
    },
  },
})
