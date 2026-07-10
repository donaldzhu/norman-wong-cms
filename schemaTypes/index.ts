import {
  allProjectsLayout,
  allProjectsMedia,
  allProjectsProject,
  contact,
  imageObject,
  projectSlide,
  projectSlideMedia,
  videoObject,
} from './objects'

import { allProjects } from './singletons/allProjects'
import { header } from './singletons/header'
import { info } from './singletons/info'
import { project } from './documents/project'
import { selectedWorks } from './singletons/selectedWorks'

export const schemaTypes = [
  contact,
  imageObject,
  videoObject,
  projectSlide,
  project,
  allProjects,
  allProjectsLayout,
  allProjectsProject,
  allProjectsMedia,
  projectSlideMedia,
  selectedWorks,
  info,
  header,
]
