import { createToggleButtonField, createToggleMediaFields } from '../../../utils/field'
import { defineField, defineType } from 'sanity'

import { ImageFieldWrapper } from '../../../components/common/imageFIeldWrapper'
import { MediaType } from '../../../constants/enum'
import { ProjectSlideMediaInput } from '../../../components/projectSlide/projectSlideMediaInput'
import { ProjectSlidePreview } from '../../../components/previews/projectSlidePreview'
import { ProjectsIcon } from '@sanity/icons'
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
    ...createToggleMediaFields(),
    createToggleButtonField({ name: 'mobileMediaType' }),
    defineField({
      name: 'mobileImage',
      type: 'image',
      options: {
        sources: [mediaAssetSource],
      },
      hidden: ({ parent }) => parent?.mobileMediaType !== MediaType.IMAGE,
      components: {
        input: ImageFieldWrapper,
      },
    }),
    defineField({
      name: 'mobileVideo',
      type: 'mux.video',
      hidden: ({ parent }) => parent?.mobileMediaType !== MediaType.VIDEO,
    }),
    defineField({
      name: 'desktopStart',
      title: 'Desktop Start Column',
      type: 'number',
      initialValue: 11,
      hidden: true
    }),
    defineField({
      name: 'desktopEnd',
      title: 'Desktop End Column',
      type: 'number',
      initialValue: 15,
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
      initialValue: 8,
      hidden: true
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
