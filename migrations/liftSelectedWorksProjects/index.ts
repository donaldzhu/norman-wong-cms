import { at, defineMigration, set, unset } from 'sanity/migrate'

/**
 * Schema change: `projects` moves from `selectedWorksLayout` up to the
 * `selectedWorks` document. Both `desktopLayout` and `mobileLayout` keep their
 * own `rowSettings`, but they now share the same set of project blocks.
 *
 * Migration rules:
 *  - If the document already has a top-level `projects` array, leave it.
 *  - Otherwise, lift `desktopLayout.projects` if present, falling back to
 *    `mobileLayout.projects`. (Per product, mobile is currently empty, so this
 *    is effectively just desktop → top-level.)
 *  - Unset the legacy nested `projects` field on both layouts.
 *
 * Run (dry by default):
 *   npx sanity migration run liftSelectedWorksProjects --no-progress
 *
 * Apply for real:
 *   npx sanity migration run liftSelectedWorksProjects --no-dry-run
 */

type ProjectBlock = { _key?: string; _type?: string; [k: string]: unknown }
type LegacyLayout = { projects?: ProjectBlock[]; rowSettings?: number[] }

type LegacySelectedWorks = {
  _id: string
  _type: 'selectedWorks'
  projects?: ProjectBlock[]
  desktopLayout?: LegacyLayout
  mobileLayout?: LegacyLayout
}

export default defineMigration({
  title: 'Lift selectedWorks.projects up from desktopLayout / mobileLayout',
  documentTypes: ['selectedWorks'],

  migrate: {
    document(doc) {
      const d = doc as unknown as LegacySelectedWorks

      const hasTopLevel = Array.isArray(d.projects)
      const desktopProjects = Array.isArray(d.desktopLayout?.projects)
        ? d.desktopLayout!.projects!
        : []
      const mobileProjects = Array.isArray(d.mobileLayout?.projects)
        ? d.mobileLayout!.projects!
        : []

      const lifted: ProjectBlock[] = hasTopLevel
        ? d.projects!
        : desktopProjects.length > 0
          ? desktopProjects
          : mobileProjects

      const patches = []

      if (!hasTopLevel) {
        patches.push(at('projects', set(lifted)))
      }

      if (d.desktopLayout && 'projects' in d.desktopLayout) {
        patches.push(at('desktopLayout.projects', unset()))
      }
      if (d.mobileLayout && 'projects' in d.mobileLayout) {
        patches.push(at('mobileLayout.projects', unset()))
      }

      return patches
    },
  },
})
