import { Box } from '@sanity/ui'
import { ERROR_ICON_SIZE } from '../../constants/configs'
import { ErrorOutlineIcon } from '@sanity/icons'

export const ErrorIcon = () => (
  <Box
    style={{
      color: 'var(--card-badge-critical-icon-color)',
      width: ERROR_ICON_SIZE,
      height: ERROR_ICON_SIZE,
    }}
  >
    <ErrorOutlineIcon width={ERROR_ICON_SIZE} height={ERROR_ICON_SIZE} />
  </Box>
)