import {
  allProjectsThumbnail,
  contact,
  imageObject,
  projectSlide,
  projectSlideMedia,
  selectedWorksLayout,
  selectedWorksProject,
  selectedWorksMedia,
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
  allProjectsThumbnail,
  projectSlide,
  project,
  allProjects,
  selectedWorksLayout,
  selectedWorksProject,
  selectedWorksMedia,
  projectSlideMedia,
  selectedWorks,
  info,
  header,
]
