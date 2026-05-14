import * as changeCase from 'change-case'

import { MediaType } from '../../../constants/enum'
import { SelectedWorksProjectContext } from '../../../components/selectedWorks/selectedWorksProjectContext'
import { createToggleMediaFields } from '../../../utils/field'
import { defineType } from 'sanity'

export const selectedWorksMedia = defineType({
  name: 'selectedWorksProjectMedia',
  title: 'Image or file',
  type: 'object',
  fields: createToggleMediaFields(SelectedWorksProjectContext),
  preview: {
    select: {
      mediaType: 'mediaType',
      image: MediaType.IMAGE,
      video: MediaType.VIDEO,
    },
    prepare({ mediaType, image, video }) {
      const t = mediaType ?? MediaType.IMAGE
      return {
        title: changeCase.capitalCase(t),
        media: t === MediaType.VIDEO ? video : image,
      }
    },
  },
})
