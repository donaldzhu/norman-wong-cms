import { MediaType, Size } from '../../../constants/enum'
import { defineField, defineType } from 'sanity'

import { SelectedWorksThumbnailPreview } from '../../../components/previews/selectedWorksThumbnailPreview'
import { ButtonToggleInput } from '../../../components/common/buttonToggleInput'
import { createToggleMediaFields } from '../../../utils/field'

const SIZE_FIELDSET = 'sizes'
export const selectedWorksThumbnail = defineType({
  name: 'selectedWorksThumbnail',
  title: 'Image or file',
  type: 'object',
  components: { preview: SelectedWorksThumbnailPreview },
  fieldsets: [
    {
      name: SIZE_FIELDSET,
      title: 'Size Settings',
      options: { columns: 2 }
    },
  ],
  fields: [
    ...createToggleMediaFields(),
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
      hideOnMobile: 'hideOnMobile',
    }
  },
})
