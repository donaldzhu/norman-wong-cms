import { slideV2Error } from '../../../utils/projectSlideV2'
import { GRID_SETTINGS_INCOMPLETE_MESSAGE, validateSlideGrid } from '../../../utils/projectSlide'
import { defineField, defineType } from 'sanity'

import { Orientation } from '../../../constants/enum'
import type { ProjectSlideFormValue } from '../../../components/types/media'
import { ProjectSlideGridButton } from '../../../components/projectSlide/projectSlideGridButton'
import { ProjectSlidesPreview } from '../../../components/previews/projectSlidesPreview'

export const projectSlide = defineType({
  name: 'projectSlide',
  type: 'object',
  components: {
    input: ProjectSlideGridButton,
    preview: ProjectSlidesPreview
  },
  validation: rule =>
    rule.custom(value => {
      const slide = value as ProjectSlideFormValue | undefined
      if (slide?.layoutV2) return slideV2Error(slide) ?? true
      const orientation = (slide?.mobileOrientation ?? Orientation.PORTRAIT) as Orientation
      return validateSlideGrid(slide?.media, orientation)
        ? GRID_SETTINGS_INCOMPLETE_MESSAGE
        : true
    }),
  fields: [
    defineField({ name: 'layoutV2', type: 'projectSlideLayoutV2', hidden: true, initialValue: { _type: 'projectSlideLayoutV2', version: 2, desktop: { _type: 'projectSlideDesktopLayout', mode: 'center' }, mobile: { _type: 'projectSlideMobileLayout', auto: true, orientation: 'portrait', mode: 'center' } } }),
    defineField({
      name: 'mobileOrientation',
      title: 'Mobile grid orientation',
      type: 'string',
      initialValue: Orientation.PORTRAIT,
      options: {
        layout: 'dropdown',
        list: [
          { title: 'Portrait', value: Orientation.PORTRAIT },
          { title: 'Landscape', value: Orientation.LANDSCAPE },
        ],
      },
      validation: rule => rule.custom((value, context) => (context.parent as ProjectSlideFormValue)?.layoutV2 || value ? true : 'Required'),
      hidden: () => true,
    }),
    defineField({
      name: 'media',
      type: 'array',
      of: [{ type: 'projectSlideMedia' }],
      description: 'Maximum 4 images/videos.',
      validation: rule => rule.required().min(1).max(4),
    }),
  ],
  preview: {
    select: {
      media: 'media',
    },
  },
})
