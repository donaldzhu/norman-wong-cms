import { createToggleButtonField, createToggleMediaFields } from '../../../utils/field'
import { defineField, defineType } from 'sanity'

import { ImageFieldWrapper } from '../../../components/common/imageFIeldWrapper'
import { MediaType } from '../../../constants/enum'
import { ProjectSlideMediaInput } from '../../../components/projectSlide/projectSlideMediaInput'
import { ProjectSlidePreview } from '../../../components/previews/projectSlidePreview'
import { ProjectsIcon } from '@sanity/icons'
import { isDesktopMediaUnset } from '../../../utils/projectSlide'
import { mediaAssetSource } from 'sanity-plugin-media'

export const projectSlideMedia = defineType({
  name: 'projectSlideMedia',
  type: 'object',
  icon: ProjectsIcon,
  components: {
    input: ProjectSlideMediaInput,
    preview: ProjectSlidePreview,
  },
  fields: [
    defineField({ name: 'desktopSpan', type: 'number', initialValue: 6, hidden: true }),
    defineField({ name: 'mobileSpan', type: 'number', initialValue: 3, hidden: true }),
    ...createToggleMediaFields({ limitToProject: false }),
    createToggleButtonField({
      name: 'mobileMediaType',
      hidden: ({ parent }) => isDesktopMediaUnset(parent),
    }),
    defineField({
      name: 'mobileImage',
      type: 'image',
      options: {
        sources: [mediaAssetSource],
      },
      hidden: ({ parent }) =>
        isDesktopMediaUnset(parent) || parent?.mobileMediaType !== MediaType.IMAGE,
      components: {
        input: ImageFieldWrapper,
      },
    }),
    defineField({
      name: 'mobileVideo',
      type: 'mux.video',
      hidden: ({ parent }) =>
        isDesktopMediaUnset(parent) || parent?.mobileMediaType !== MediaType.VIDEO,
    }),
    defineField({
      name: 'desktopStart',
      title: 'Desktop Start Column',
      type: 'number',
      initialValue: 10,
      hidden: true
    }),
    defineField({
      name: 'desktopEnd',
      title: 'Desktop End Column',
      type: 'number',
      initialValue: 16,
      hidden: true
    }),
    defineField({
      name: 'mobileStart',
      title: 'Mobile Start Edge',
      type: 'number',
      initialValue: 4,
      hidden: true
    }),
    defineField({
      name: 'mobileEnd',
      title: 'Mobile End Edge',
      type: 'number',
      initialValue: 10,
      hidden: true
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: 'image',
      video: 'video',
      desktopSpan: 'desktopSpan',
      desktopStart: 'desktopStart',
      desktopEnd: 'desktopEnd',
    },
  },
})
