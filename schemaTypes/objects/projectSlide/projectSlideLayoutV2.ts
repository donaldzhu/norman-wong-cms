import { defineField, defineType } from 'sanity'
const mode = () => defineField({ name: 'mode', type: 'string', options: { list: ['center', 'justify'] }, validation: rule => rule.required() })
export const projectSlideDesktopLayout = defineType({ name: 'projectSlideDesktopLayout', type: 'object', fields: [mode()] })
export const projectSlideMobileLayout = defineType({ name: 'projectSlideMobileLayout', type: 'object', fields: [
  defineField({ name: 'auto', type: 'boolean', validation: rule => rule.required() }),
  defineField({ name: 'orientation', type: 'string', options: { list: ['portrait','landscape'] }, validation: rule => rule.required() }), mode(),
] })
export const projectSlideLayoutV2 = defineType({ name: 'projectSlideLayoutV2', type: 'object', fields: [
  defineField({ name: 'version', type: 'number', validation: rule => rule.required().min(2).max(2) }),
  defineField({ name: 'desktop', type: 'projectSlideDesktopLayout', validation: rule => rule.required() }),
  defineField({ name: 'mobile', type: 'projectSlideMobileLayout', validation: rule => rule.required() }),
] })
