import { createContext, useContext, type ReactNode } from 'react'
import type { Ref } from '../types/media'

export type ProjectRefValue = Ref | undefined

export const SelectedWorksProjectContext = createContext<ProjectRefValue>(undefined)

export const SelectedWorksProjectProvider = ({
  projectRef,
  children,
}: {
  projectRef: ProjectRefValue
  children: ReactNode
}) => (
  <SelectedWorksProjectContext.Provider value={projectRef}>
    {children}
  </SelectedWorksProjectContext.Provider>
)
export function useSelectedWorksProjectRef(): ProjectRefValue {
  return useContext(SelectedWorksProjectContext)
}
