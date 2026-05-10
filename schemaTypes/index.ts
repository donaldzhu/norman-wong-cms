import {
  allProjectsThumbnail,
  contact,
  imageObject,
  projectSlide,
  projectSlideMedia,
  selectedWorksLayout,
  selectedWorksProject,
  selectedWorksProjectMedia,
  videoObject,
} from './objects'

import { allProjects } from './allProjects'
import { header } from './header'
import { info } from './info'
import { project } from './project'
import { selectedWorks } from './selectedWorks'

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
  selectedWorksProjectMedia,
  projectSlideMedia,
  selectedWorks,
  info,
  header,
]
