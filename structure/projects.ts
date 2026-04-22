import {ProjectsIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'

export function projectsStructure(S: StructureBuilder) {
  return S.listItem()
    .title('Projects')
    .icon(ProjectsIcon)
    .child(S.documentTypeList('project').title('Projects'))
}
