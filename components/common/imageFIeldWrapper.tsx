import { Box } from '@sanity/ui'
import type { ObjectInputProps } from 'sanity'

export const ImageFieldWrapper = (props: ObjectInputProps) => {
  return (
    <Box className="image-field-wrapper">
      {props.renderDefault(props)}
    </Box>
  )
}