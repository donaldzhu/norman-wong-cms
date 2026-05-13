import { Stack } from '@sanity/ui'
import { useEffect, type ReactElement } from 'react'
import { set, unset, type ObjectInputProps } from 'sanity'

import { ColumnRangeStrip } from './columnRangeStrip'
import {
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from '../../utils/columnRange'

type MobileOrientation = 'portrait' | 'landscape'

type ProjectSlideMediaValue = {
  desktopStart?: number
  desktopEnd?: number
  automaticMobileLayout?: boolean
  mobileOrientation?: MobileOrientation
  mobileStart?: number
  mobileEnd?: number
}

export function ProjectSlideMediaObjectInput(
  props: ObjectInputProps<ProjectSlideMediaValue>,
): ReactElement {
  const { renderDefault, value, onChange, readOnly } = props
  const mobileOrientation: MobileOrientation =
    value?.mobileOrientation === 'landscape' ? 'landscape' : 'portrait'
  const mobileAxis = mobileOrientation === 'portrait' ? 'row' : 'column'
  const mobileCellCount =
    mobileOrientation === 'portrait' ? MOBILE_PORTRAIT_ROW_COUNT : MOBILE_LANDSCAPE_COLUMN_COUNT
  const mobileEndEdgeMax = mobileCellCount + 1

  useEffect(() => {
    if (value?.automaticMobileLayout) return

    const patches: ReturnType<typeof set>[] = []

    const nextStart =
      typeof value?.mobileStart === 'number'
        ? Math.min(value.mobileStart, mobileCellCount)
        : undefined
    const nextEnd =
      typeof value?.mobileEnd === 'number'
        ? Math.min(value.mobileEnd, mobileEndEdgeMax)
        : undefined

    if (typeof nextStart === 'number' && nextStart !== value?.mobileStart) {
      patches.push(set(nextStart, ['mobileStart']))
    }

    if (typeof nextEnd === 'number') {
      const validEnd =
        typeof nextStart === 'number' && nextEnd <= nextStart
          ? Math.min(nextStart + 1, mobileEndEdgeMax)
          : nextEnd

      if (validEnd !== value?.mobileEnd) {
        patches.push(set(validEnd, ['mobileEnd']))
      }
    }

    if (patches.length > 0) onChange(patches)
  }, [
    mobileCellCount,
    mobileEndEdgeMax,
    onChange,
    value?.automaticMobileLayout,
    value?.mobileEnd,
    value?.mobileStart,
  ])

  return (
    <Stack space={2}>
      {renderDefault(props)}

      <Stack space={3}>
        <ColumnRangeStrip
          layout="desktop"
          title="Desktop column span"
          start={value?.desktopStart}
          end={value?.desktopEnd}
          readOnly={readOnly}
          onCommit={(start, end) => {
            onChange([set(start, ['desktopStart']), set(end, ['desktopEnd'])])
          }}
          onClear={() => {
            onChange([unset(['desktopStart']), unset(['desktopEnd'])])
          }}
        />

        {!value?.automaticMobileLayout ? (
          <ColumnRangeStrip
            layout="mobile"
            axis={mobileAxis}
            cellCount={mobileCellCount}
            title={`Mobile ${mobileOrientation} span`}
            start={value?.mobileStart}
            end={value?.mobileEnd}
            readOnly={readOnly}
            onCommit={(start, end) => {
              onChange([set(start, ['mobileStart']), set(end, ['mobileEnd'])])
            }}
            onClear={() => {
              onChange([unset(['mobileStart']), unset(['mobileEnd'])])
            }}
          />
        ) : null}
      </Stack>
    </Stack>
  )
}
