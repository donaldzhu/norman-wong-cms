import { createContext, useMemo, type ComponentProps, type ReactElement } from 'react'
import { ImageInput } from 'sanity'
import type { ObjectInputProps } from 'sanity'

import {
  type FormPathSegment,
  selectedWorksSectionPathFromFieldPath,
} from '../utils/selectedWorksSectionPath'

/** For slide-image asset UI: resolve parent section without relying on `focusPath` in portals. */
export const referencedAssetContext = createContext<
  readonly FormPathSegment[] | null
>(null)

type SanityImageInputProps = ComponentProps<typeof ImageInput>

export function SelectedWorksThumbnailImageInput(props: ObjectInputProps): ReactElement {
  const sectionPath = useMemo(
    () => selectedWorksSectionPathFromFieldPath((props.path ?? []) as FormPathSegment[]),
    [props.path],
  )

  return (
    <referencedAssetContext.Provider value={sectionPath}>
      <ImageInput {...(props as unknown as SanityImageInputProps)} />
    </referencedAssetContext.Provider>
  )
}
