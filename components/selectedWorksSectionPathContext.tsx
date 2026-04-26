import { createContext, useMemo, type ComponentProps, type ReactElement } from 'react'
import { ImageInput } from 'sanity'
import type { ObjectInputProps } from 'sanity'

import {
  type FormPathSegment,
  selectedWorksSectionPathFromFieldPath,
} from '../utils/selectedWorksSectionPath'

/** Form path to the current Selected Works section — for slide asset UI when `focusPath` is missing in portals. */
export const selectedWorksSectionPathContext = createContext<
  readonly FormPathSegment[] | null
>(null)

type SanityImageInputProps = ComponentProps<typeof ImageInput>

export const SelectedWorksImageInput = (props: ObjectInputProps): ReactElement => {
  const sectionPath = useMemo(
    () => selectedWorksSectionPathFromFieldPath((props.path ?? []) as FormPathSegment[]),
    [props.path],
  )

  return (
    <selectedWorksSectionPathContext.Provider value={sectionPath}>
      <ImageInput {...(props as unknown as SanityImageInputProps)} />
    </selectedWorksSectionPathContext.Provider>
  )
}
