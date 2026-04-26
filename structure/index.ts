import type { StructureResolver } from 'sanity/structure'
import { allProjectsStructure } from './allProjects'
import { headerStructure } from './header'
import { infoStructure } from './info'
import { projectsStructure } from './projects'
import { selectedWorksStructure } from './selectedWorks'

const singletonDocumentTypes = ['allProjects', 'selectedWorks', 'info', 'header'] as const
const manuallyListedDocumentTypes = ['project', 'media.tag'] as const

const excludedFromAutomaticList = (id: string): boolean => {
  if ((singletonDocumentTypes as readonly string[]).includes(id)) return true
  if ((manuallyListedDocumentTypes as readonly string[]).includes(id)) return true
  return false
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      headerStructure(S),
      selectedWorksStructure(S),
      allProjectsStructure(S),
      infoStructure(S),
      S.divider(),
      projectsStructure(S),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId()
        if (!id) return false
        return !excludedFromAutomaticList(id)
      }),
    ])
