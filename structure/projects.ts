import { ProjectsIcon } from '@sanity/icons'
import type { StructureBuilder } from 'sanity/structure'

export const projectsStructure = (S: StructureBuilder) =>
  S.listItem()
    .title('Projects')
    .icon(ProjectsIcon)
    .child(S.documentTypeList('project').title('Projects'))
