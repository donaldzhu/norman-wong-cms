import { allProjects } from './allProjects'
import { allProjectsThumbnail } from './allProjectsThumbnail'
import { contact } from './contact'
import { header } from './header'
import { info } from './info'
import { project } from './project'
import { projectSlide } from './projectSlide'
import { fileObject, imageObject } from './slideMediaObjects'
import { selectedWorks } from './selectedWorks'
import { selectedWorksSection } from './selectedWorksSection'
import { selectedWorksThumbnail } from './selectedWorksThumbnail'

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
