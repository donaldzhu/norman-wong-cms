import { Box, Dialog } from '@sanity/ui'
import type { ValidAssetRef, ValidMediaRef } from '../types/media'

import { MediaType } from '../../constants/enum'
import { RefMediaPickerGrid } from './refMediaPickerGrid'
import { useClickAway } from '@uidotdev/usehooks'

type RefMediaPickerDialogProps = {
  mediaType: MediaType
  refs: ValidMediaRef[]
  header: string
  id: string
  onClose: () => void
  onPick: (ref: string) => void
}

export const RefMediaPickerDialog = ({
  mediaType,
  refs,
  header,
  id,
  onClose,
  onPick,
}: RefMediaPickerDialogProps) => {
  const containerRef = useClickAway<HTMLDivElement>(onClose)
  return (
    <Dialog id={id} header={header} onClose={onClose} width={3} zOffset={999} open>
      <Box padding={2} ref={containerRef}>
        <RefMediaPickerGrid refs={refs} onPick={onPick} mediaType={mediaType} />
      </Box>
    </Dialog>
  )
}
