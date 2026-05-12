import { Button, Stack } from '@sanity/ui'
import {
  useCallback,
  useMemo,
  useState,
  type ComponentType,
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
import { MediaType } from '../../constants/enum'
import { mediaRefsFromProject } from '../../utils/refs'
import { RefMediaPickerDialog } from './refMediaPickerDialog'
import { RefMediaPickerPreview } from './refMediaPickerPreview'

const createCopy = (mediaType: MediaType) => {
  return {
    select: `Select ${mediaType} from project`,
    none: `This project contains no ${mediaType}s`,
    dialogId: `asset-picker-${mediaType}`,
    dialogHeader: `Choose ${mediaType} from project`,
  }
}

interface RefMediaPickerButtonProps {
  fieldId: string
  mediaType: MediaType
}

const RefMediaPickerButton = ({ fieldId, mediaType, value, onChange }: RefMediaPickerButtonProps & ObjectInputProps) => {
  const source = useFormValue([fieldId])
  const copy = createCopy(mediaType)
  const refs = useMemo(() => mediaRefsFromProject(source), [mediaType, source])


  const isEmpty = refs.length === 0
  const assetRef = value?.asset?._ref as string | undefined

  const [open, setOpen] = useState(false)

  const handlePick = useCallback(
    (selectedRef: string) => {
      onChange(
        set(
          mediaType === MediaType.IMAGE
            ? { _type: 'image', asset: { _type: 'reference', _ref: selectedRef } }
            : { _type: 'mux.video', asset: { _type: 'reference', _ref: selectedRef } },
        ),
      )
      setOpen(false)
    },
    [mediaType, onChange],
  )

  const handleClear = useCallback(() => onChange(unset()), [onChange])

  return (
    <Stack space={2}>
      {assetRef ? (
        <RefMediaPickerPreview
          mediaType={mediaType}
          assetRef={assetRef}
          onReplace={() => setOpen(true)}
          onClear={handleClear}
        />
      ) : (
        <Button
          mode="ghost"
          icon={SearchIcon}
          text={isEmpty ? copy.none : copy.select}
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
  fieldId,
  mediaType,
}: RefMediaPickerButtonProps): ComponentType<ObjectInputProps> =>
  (props: ObjectInputProps) =>
    <RefMediaPickerButton fieldId={fieldId} mediaType={mediaType} {...props} />

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
