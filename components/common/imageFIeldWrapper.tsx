import { Box } from '@sanity/ui'
import type { ObjectInputProps } from 'sanity'

export const ImageFieldWrapper = (props: ObjectInputProps) => {
  const NOT_REMOVABLE_CLASS_NAME = 'image-field-wrapper'
  return (
    <Box className={NOT_REMOVABLE_CLASS_NAME}>
      {props.renderDefault(props)}
    </Box>
  )
}