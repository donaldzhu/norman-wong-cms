import { Box } from '@sanity/ui'
import { useClickAway } from '@uidotdev/usehooks'
import { useCallback, useState, type CSSProperties, type MouseEvent } from 'react'

import { cellIsInSpan, spanFromClickedCells, getSpanFromSingleCell } from '../../../utils/columnRange'

/** Same click rules as `ColumnRangeStrip` / desktop overlay; horizontal = columns, vertical = rows. */
export const LinearSpanInteractionOverlay = ({
  direction,
  cellCount,
  start,
  end,
  readOnly,
  onCommit,
  ariaLabel,
}: {
  direction: 'horizontal' | 'vertical'
  cellCount: number
  start: number | undefined
  end: number | undefined
  readOnly: boolean
  onCommit: (start: number, end: number) => void
  ariaLabel: string
}) => {
  const [pendingAnchor, setPendingAnchor] = useState<number | null>(null)
  const containerRef = useClickAway<HTMLDivElement>(() => setPendingAnchor(null))

  const handleCellClick = useCallback(
    (cell: number, event: MouseEvent<HTMLButtonElement>) => {
      if (readOnly) return

      if (event.shiftKey || pendingAnchor == null) {
        const { start: s, end: e } = getSpanFromSingleCell(cell)
        onCommit(s, e)
        setPendingAnchor(cell)
        return
      }

      if (cell <= pendingAnchor) {
        const { start: s, end: e } = getSpanFromSingleCell(cell)
        onCommit(s, e)
        setPendingAnchor(cell)
        return
      }

      const { start: s, end: e } = spanFromClickedCells(pendingAnchor, cell)
      onCommit(s, e)
      setPendingAnchor(null)
    },
    [pendingAnchor, onCommit, readOnly],
  )

  const cells = Array.from({ length: cellCount }, (_, i) => i + 1)

  const overlayStyle: CSSProperties =
    direction === 'horizontal'
      ? {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${cellCount}, minmax(0, 1fr))`,
        gridTemplateRows: '1fr',
        gap: 1,
        zIndex: 60,
        pointerEvents: readOnly ? 'none' : 'auto',
      }
      : {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: `repeat(${cellCount}, minmax(0, 1fr))`,
        gap: 1,
        zIndex: 60,
        pointerEvents: readOnly ? 'none' : 'auto',
      }

  return (
    <Box ref={containerRef} role="group" aria-label={ariaLabel} style={overlayStyle}>
      {cells.map(cell => {
        const selected = start != null && end != null && cellIsInSpan(cell, start, end)
        const zebra = cell % 2 === 0 ? 'rgba(127,127,127,0.12)' : 'rgba(127,127,127,0.06)'

        return (
          <button
            key={cell}
            type="button"
            disabled={readOnly}
            onClick={event => handleCellClick(cell, event)}
            title={direction === 'horizontal' ? `Column ${cell}` : `Row ${cell}`}
            style={{
              position: 'relative',
              margin: 0,
              padding: 0,
              minWidth: 0,
              minHeight: 0,
              border: 0,
              borderRadius: 2,
              cursor: readOnly ? 'default' : 'pointer',
              background: 'transparent',
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: zebra,
                pointerEvents: 'none',
                borderRadius: 2,
              }}
            />
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: selected ? 'var(--sanity-color-accent-fg, #2276fc)' : 'transparent',
                opacity: selected ? 0.35 : 0,
                pointerEvents: 'none',
              }}
            />
          </button>
        )
      })}
    </Box>
  )
}
