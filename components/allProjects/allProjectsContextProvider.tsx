import type { ObjectInputProps } from 'sanity'
import type { Ref } from '../types/media'
import { useFormValue } from 'sanity'
import { createContext, type ReactNode } from 'react'

type ProjectRefValue = Ref | undefined

export const AllProjectsProjectContext = createContext<ProjectRefValue>(undefined)

const AllProjectsContextProvider = ({
  projectRef,
  children,
}: {
  projectRef: ProjectRefValue
  children: ReactNode
}) => (
  <AllProjectsProjectContext.Provider value={projectRef}>
    {children}
  </AllProjectsProjectContext.Provider>
)

export const AllProjectsProjectInput = (
  props: ObjectInputProps<{ project?: Ref }>,
) => {
  const { path, renderDefault, value } = props
  const pathArr = path ?? []
  const projectFromForm = useFormValue([...pathArr, 'project']) as ProjectRefValue
  const projectRef = projectFromForm ?? value?.project

  return (
    <AllProjectsContextProvider projectRef={projectRef}>
      {renderDefault(props)}
    </AllProjectsContextProvider>
  )
}
