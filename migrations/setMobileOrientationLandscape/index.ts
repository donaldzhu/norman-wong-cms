import { at, defineMigration, set } from 'sanity/migrate'

/**
 * Set `mobileOrientation` to `'landscape'` on every `projectSlideMedia` inside
 * `project.slides[].media[]`. Overwrites any existing value (including legacy
 * `'row'` / `'column'`) and fills in missing values.
 *
 * Run (dry by default):
 *   npx sanity migration run setMobileOrientationLandscape --no-progress
 *
 * Apply for real:
 *   npx sanity migration run setMobileOrientationLandscape --no-dry-run
 */

type ProjectSlideMedia = {
  _key?: string
  _type?: string
  mobileOrientation?: unknown
}

type ProjectSlide = {
  _key?: string
  _type?: string
  media?: ProjectSlideMedia[]
}

type ProjectDoc = {
  _id: string
  _type: 'project'
  slides?: ProjectSlide[]
}

export default defineMigration({
  title: "Set projectSlideMedia.mobileOrientation to 'landscape'",
  documentTypes: ['project'],

  migrate: {
    document(doc) {
      const project = doc as unknown as ProjectDoc
      const slides = Array.isArray(project.slides) ? project.slides : []

      const patches = []

      for (const slide of slides) {
        if (!slide?._key) continue
        const media = Array.isArray(slide.media) ? slide.media : []

        for (const item of media) {
          if (!item?._key) continue
          if (item.mobileOrientation === 'landscape') continue

          patches.push(
            at(
              `slides[_key=="${slide._key}"].media[_key=="${item._key}"].mobileOrientation`,
              set('landscape'),
            ),
          )
        }
      }

      return patches
    },
  },
})
