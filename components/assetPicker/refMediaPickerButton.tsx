import { Button, Spinner, Stack } from '@sanity/ui'
import {
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type Context,
  type ReactElement
} from 'react'
import {
  FormField,
  set,
  unset,
  useFormValue,
  type ObjectFieldProps,
  type ObjectInputProps
} from 'sanity'

import { SearchIcon } from '@sanity/icons'
import { SLIDE_FIELD_ID } from '../../constants/configs'
import { MediaType } from '../../constants/enum'
import { mediaRefsFromProject } from '../../utils/refs'
import { DummyContext } from '../common/dummyContext'
import { useProjectSlides } from '../hooks/useProjectSlides'
import type { Ref } from '../types/media'
import { RefMediaPickerDialog } from './refMediaPickerDialog'
import { RefMediaPickerPreview } from './refMediaPickerPreview'

const createCopy = (mediaType: MediaType) => {
  return {
    select: `Select ${mediaType} from project`,
    none: `This project contains no ${mediaType}s`,
    loading: `Loading ${mediaType}s from project...`,
    dialogId: `asset-picker-${mediaType}`,
    dialogHeader: `Choose ${mediaType} from project`,
  }
}

interface RefMediaPickerButtonProps {
  mediaType: MediaType
  RefContext?: Context<Ref | undefined>
}

const RefMediaPickerButton = ({
  value,
  onChange,
  mediaType,
  RefContext
}: RefMediaPickerButtonProps & ObjectInputProps) => {
  const source = useFormValue([SLIDE_FIELD_ID])
  const project = useContext(RefContext ?? DummyContext)
  const { isLoading, slides } = useProjectSlides(project)

  const copy = createCopy(mediaType)
  const refs = useMemo(() =>
    mediaRefsFromProject(RefContext ? slides : source),
    [mediaType, source, slides, RefContext]
  )

  const isEmpty = refs.length === 0
  const assetRef = value?.asset?._ref as string | undefined

  const [open, setOpen] = useState(false)

  const handlePick = (selectedRef: string) => {
    const _type = mediaType === MediaType.IMAGE ? 'image' : 'mux.video'
    const asset = { _type: 'reference', _ref: selectedRef }
    onChange(set({ _type, asset }))
    setOpen(false)
  }

  return (
    <Stack space={2}>
      {assetRef ? (
        <RefMediaPickerPreview
          mediaType={mediaType}
          assetRef={assetRef}
          onReplace={() => setOpen(true)}
          onClear={() => onChange(unset())}
        />
      ) : (
        <Button
          mode="ghost"
          icon={isLoading ? Spinner : SearchIcon}
          text={isLoading ? copy.loading : isEmpty ? copy.none : copy.select}
          disabled={isEmpty}
          onClick={() => setOpen(true)}
          style={{ width: '100%' }}
        />
      )}
      {open ? (
        <RefMediaPickerDialog
          mediaType={mediaType}
          refs={refs}
          header={copy.dialogHeader}
          id={copy.dialogId}
          onClose={() => setOpen(false)}
          onPick={handlePick}
        />
      ) : null}
    </Stack>
  )
}

export const createAssetPickerButton = ({
  mediaType,
  RefContext,
}: RefMediaPickerButtonProps): ComponentType<ObjectInputProps> =>
  (props: ObjectInputProps) =>
    <RefMediaPickerButton
      {...props}
      mediaType={mediaType}
      RefContext={RefContext} />

export const AssetPickerField = (props: ObjectFieldProps): ReactElement => (
  <FormField
    title={props.title}
    description={props.description}
    inputId={props.inputId}
    validation={props.validation}
    level={props.level}
    path={props.path}
    __unstable_presence={props.presence}
  >
    {props.children}
  </FormField>
)
