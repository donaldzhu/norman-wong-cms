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

  plugins: [
    structureTool({ structure }),
    visionTool(),
    media({
      directUploads: false,
    }),
    muxInput({
      video_quality: 'basic',
      max_resolution_tier: '1080p',
      disableTextTrackConfig: true,
      normalize_audio: true,
    })
  ],


  tools: prev => prev
    .filter((tool) => tool.name !== 'vision' && tool.name !== 'releases')
    .map(tool => {
      if (tool.name === 'media') {
        return {
          ...tool,
          title: 'Images (Read-Only)',
        }
      }
      if (tool.name === 'mux') {
        return {
          ...tool,
          title: 'Videos (Read-Only)',
        }
      }
      return tool
    }),

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
  },
})
