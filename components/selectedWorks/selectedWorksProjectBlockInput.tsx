import type { ObjectInputProps } from 'sanity'
import { SelectedWorksProjectBlockProvider } from './selectedWorksProjectContext'
import { useFormValue } from 'sanity'

type BlockValue = {
  project?: { _ref?: string; _weak?: boolean }
}

/** Wraps the project block so nested fields (image source, mux picker) can read `project` via context. */
export const SelectedWorksProjectBlockInput = (
  props: ObjectInputProps<BlockValue>,
) => {
  const { path, renderDefault, value } = props
  const pathArr = path ?? []
  const projectFromForm = useFormValue([...pathArr, 'project']) as BlockValue['project']
  const projectRef = projectFromForm ?? value?.project

  return (
    <SelectedWorksProjectBlockProvider projectRef={projectRef}>
      {renderDefault(props)}
    </SelectedWorksProjectBlockProvider>
  )
}
