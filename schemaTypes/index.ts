import { allProjects } from './allProjects'
import { header } from './header'
import { info } from './info'
import {
  allProjectsThumbnail,
  contact,
  fileObject,
  imageObject,
  projectSlide,
  selectedWorksSection,
  selectedWorksThumbnail,
} from './objects'
import { project } from './project'
import { selectedWorks } from './selectedWorks'

export const schemaTypes = [
  contact,
  imageObject,
  fileObject,
  allProjectsThumbnail,
  projectSlide,
  project,
  allProjects,
  selectedWorksThumbnail,
  selectedWorksSection,
  selectedWorks,
  info,
  header,
]
