import { createContext } from 'react'

// Media previews need the slide's mode; retained spans alone do not describe Justify.
export const ProjectSlideJustifyContext = createContext(false)
