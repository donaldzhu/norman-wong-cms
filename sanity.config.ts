import { defineConfig } from 'sanity'
import { media } from 'sanity-plugin-media'
import { muxInput } from 'sanity-plugin-mux-input'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

export default defineConfig({
  name: 'default',
  title: 'Norman Wong',

  projectId: '3vmzcbnr',
  dataset: 'production',

  plugins: [structureTool({ structure }), visionTool(), media(), muxInput()],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      const singletons = ['allProjects', 'selectedWorks', 'info', 'header']
      if (singletons.includes(context.schemaType))
        return prev.filter(
          (action) => !['delete', 'duplicate'].includes(action?.action ?? '')
        )
      return prev
    }
  }
})
