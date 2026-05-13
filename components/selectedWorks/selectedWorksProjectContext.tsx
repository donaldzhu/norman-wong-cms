import { createContext, useContext, type ReactNode } from 'react'

export type ProjectRefValue = { _ref?: string; _weak?: boolean } | undefined

const SelectedWorksProjectBlockContext = createContext<ProjectRefValue>(undefined)

export function SelectedWorksProjectBlockProvider({
  projectRef,
  children,
}: {
  projectRef: ProjectRefValue
  children: ReactNode
}) {
  return (
    <SelectedWorksProjectBlockContext.Provider value={projectRef}>
      {children}
    </SelectedWorksProjectBlockContext.Provider>
  )
}

export function useSelectedWorksProjectRef(): ProjectRefValue {
  return useContext(SelectedWorksProjectBlockContext)
}
