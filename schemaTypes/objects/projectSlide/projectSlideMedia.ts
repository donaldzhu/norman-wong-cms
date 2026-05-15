import {
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from '../../../components/projectSlide/projectSlideGrid/configs'
import { MediaType, Orientation } from '../../../constants/enum'
import { defineField, defineType } from 'sanity'

import { ImageFieldWrapper } from '../../../components/common/imageFIeldWrapper'
import { ProjectSlideMediaObjectInput } from '../../../components/projectSlide/projectSlideMediaObjectInput'
import { ProjectSlidePreview } from '../../../components/previews/projectSlidePreview'
import { ProjectsIcon } from '@sanity/icons'
import { createToggleButtonField } from '../../../utils/field'
import { getProjectSlideFromMediaFieldPath } from '../../../utils/getProjectSlideFromMediaFieldPath'
import { mediaAssetSource } from 'sanity-plugin-media'

const hiddenNumberField = {
  input: () => null,
  field: () => null,
}

const getMobileCellCountFromSlide = (slide: { mobileOrientation?: unknown } | undefined): number =>
  slide?.mobileOrientation === Orientation.LANDSCAPE
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
      name: 'mobileStart',
      title: 'Mobile Start Edge',
      type: 'number',
      initialValue: 11,
      validation: rule =>
        rule.custom((val, context) => {
          const slide = getProjectSlideFromMediaFieldPath(
            context.document as Record<string, unknown> | undefined,
            context.path,
          )
          if (slide?.automaticMobileLayout !== false) return true
          if (val == null) return 'Required when automatic mobile layout is off for this slide'
          if (typeof val !== 'number' || !Number.isInteger(val)) return 'Must be an integer'
          const max = getMobileCellCountFromSlide(slide)
          if (val < 1 || val > max) return `Must be between 1 and ${max}`
          return true
        }),
      hidden: ({ document, path }) =>
        getProjectSlideFromMediaFieldPath(document as Record<string, unknown> | undefined, path)
          ?.automaticMobileLayout !== false,
      components: hiddenNumberField,
    }),
    defineField({
      name: 'mobileEnd',
      title: 'Mobile End Edge',
      type: 'number',
      initialValue: 15,
      validation: rule =>
        rule.custom((end, context) => {
          const slide = getProjectSlideFromMediaFieldPath(
            context.document as Record<string, unknown> | undefined,
            context.path,
          )
          if (slide?.automaticMobileLayout !== false) return true
          if (end == null) return 'Required when automatic mobile layout is off for this slide'
          if (typeof end !== 'number' || !Number.isInteger(end)) return 'Must be an integer'
          const max = getMobileCellCountFromSlide(slide) + 1
          if (end < 2 || end > max) return `Must be between 2 and ${max}`
          const s = (context.parent as { mobileStart?: unknown } | undefined)?.mobileStart
          if (typeof s === 'number' && end <= s) return 'End edge must be after start'
          return true
        }),
      hidden: ({ document, path }) =>
        getProjectSlideFromMediaFieldPath(document as Record<string, unknown> | undefined, path)
          ?.automaticMobileLayout !== false,
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
