import type { ObjectInputProps } from 'sanity'
import type { Ref } from '../types/media'
import { useFormValue } from 'sanity'
import { createContext, type ReactNode } from 'react'

type ProjectRefValue = Ref | undefined

export const SelectedWorksProjectContext = createContext<ProjectRefValue>(undefined)

export const SelectedWorksContextProvider = ({
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

export const SelectedWorksProjectInput = (
  props: ObjectInputProps<{ project?: Ref }>,
) => {
  const { path, renderDefault, value } = props
  const pathArr = path ?? []
  const projectFromForm = useFormValue([...pathArr, 'project']) as ProjectRefValue
  const projectRef = projectFromForm ?? value?.project

  return (
    <SelectedWorksContextProvider projectRef={projectRef}>
      {renderDefault(props)}
    </SelectedWorksContextProvider>
  )
}
