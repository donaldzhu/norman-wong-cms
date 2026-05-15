import { defineField, defineType } from 'sanity'

import { ImageFieldWrapper } from '../../../components/common/imageFIeldWrapper'
import { MediaType } from '../../../constants/enum'
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
      components: hiddenNumberField,
    }),
    defineField({
      name: 'desktopEnd',
      title: 'Desktop End Column',
      type: 'number',
      initialValue: 15,
      components: hiddenNumberField,
    }),
    defineField({
      name: 'mobileStart',
      title: 'Mobile Start Edge',
      type: 'number',
      initialValue: 4,
      hidden: ({ document, path }) =>
        getProjectSlideFromMediaFieldPath(document as Record<string, unknown> | undefined, path)
          ?.automaticMobileLayout !== false,
      components: hiddenNumberField,
    }),
    defineField({
      name: 'mobileEnd',
      title: 'Mobile End Edge',
      type: 'number',
      initialValue: 8,
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
