import { EllipsisHorizontalIcon, ResetIcon, SyncIcon } from '@sanity/icons'
import { Box, Button, Card, Menu, MenuButton, MenuDivider, MenuItem } from '@sanity/ui'
import { type ReactElement } from 'react'

import { MediaType } from '../../constants/enum'
import { MediaRefPreview } from '../previews/mediaRefPreview'

const PREVIEW_IMAGE_WIDTH = 1200

interface AssetPreviewProps {
  mediaType: MediaType
  assetRef: string
  onReplace: () => void
  onClear: () => void
}

export const RefMediaPickerPreview = ({
  mediaType,
  assetRef,
  onReplace,
  onClear,
}: AssetPreviewProps): ReactElement =>
(
  <Card
    radius={2}
    shadow={1}
    tone="transparent"
    style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--card-muted-bg-color)',
      minHeight: 220,
    }}
  >
    <MediaRefPreview
      mediaWithRef={{ asset: { _ref: assetRef } }}
      mediaType={mediaType}
      sanityImageWidth={PREVIEW_IMAGE_WIDTH}
      showSpinner
    />
    <Box padding={2} style={{ position: 'absolute', top: 0, right: 0 }}>
      <MenuButton
        id={`asset-preview-menu-${mediaType}`}
        button={
          <Button
            icon={EllipsisHorizontalIcon}
            mode="ghost"
            padding={2}
            radius={2}
            aria-label="Open asset menu"
          />
        }
        menu={
          <Menu>
            <MenuItem
              icon={SyncIcon}
              text="Replace"
              onClick={onReplace}
            />
            <MenuDivider />
            <MenuItem
              icon={ResetIcon}
              text="Clear field"
              tone="critical"
              onClick={onClear}
            />
          </Menu>
        }
        popover={{ portal: true, placement: 'left' }}
      />
    </Box>
  </Card>
)


