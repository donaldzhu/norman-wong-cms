import {
  allProjectsLayout,
  allProjectsMedia,
  allProjectsProject,
  contact,
  imageObject,
  projectSlide,
  projectSlideMedia,
  selectedWorksThumbnail,
  videoObject,
} from './objects'

import { allProjects } from './singletons/allProjects'
import { header } from './singletons/header'
import { info } from './singletons/info'
import { project } from './documents/project.tsx'
import { selectedWorks } from './singletons/selectedWorks'

export const schemaTypes = [
  contact,
  imageObject,
  videoObject,
  selectedWorksThumbnail,
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
