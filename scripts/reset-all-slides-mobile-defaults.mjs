/**
 * Sets every project slide to automaticMobileLayout: true and mobileOrientation: 'landscape',
 * and removes legacy project-level automaticMobileLayout / mobileOrientation if present.
 *
 * Usage:
 *   SANITY_API_WRITE_TOKEN=sk... node scripts/reset-all-slides-mobile-defaults.mjs
 *
 * Optional env (defaults match sanity.config.ts / sanity.cli.ts):
 *   SANITY_STUDIO_PROJECT_ID  (default: 3vmzcbnr)
 *   SANITY_STUDIO_DATASET     (default: production)
 */

import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '3vmzcbnr'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const token =
  process.env.SANITY_API_WRITE_TOKEN ||
  process.env.SANITY_AUTH_TOKEN ||
  process.env.SANITY_TOKEN

if (!token) {
  console.error(
    'Missing write token. Set SANITY_API_WRITE_TOKEN (or SANITY_AUTH_TOKEN) with Editor access.',
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const query = `*[_type == "project" && defined(slides)]{_id, slides}`

const docs = await client.fetch(query)

let count = 0
for (const doc of docs) {
  const slides = Array.isArray(doc.slides) ? doc.slides : []
  const newSlides = slides.map(slide => ({
    ...slide,
    automaticMobileLayout: true,
    mobileOrientation: 'landscape',
  }))

  await client
    .patch(doc._id)
    .set({slides: newSlides})
    .unset(['automaticMobileLayout', 'mobileOrientation'])
    .commit()
  count += 1
  console.log(`Patched project ${doc._id} (${newSlides.length} slide(s))`)
}

console.log(`Done. Patched ${count} project document(s).`)
