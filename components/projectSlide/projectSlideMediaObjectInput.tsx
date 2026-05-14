import { Stack } from '@sanity/ui'
import { useEffect } from 'react'
import { set, unset, type ObjectInputProps } from 'sanity'

import styled from 'styled-components'
import {
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from '../../utils/columnRange'
import { ColumnRangeStrip } from './columnRangeStrip'

type MobileOrientation = 'portrait' | 'landscape'

type ProjectSlideMediaValue = {
  desktopStart?: number
  desktopEnd?: number
  automaticMobileLayout?: boolean
  mobileOrientation?: MobileOrientation
  mobileStart?: number
  mobileEnd?: number
}

export const ProjectSlideMediaObjectInput = (
  props: ObjectInputProps<ProjectSlideMediaValue>,
) => {
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
    <StyledStack space={2}>
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
    </StyledStack>
  )
}


const StyledStack = styled(Stack)`
  > div[data-ui="Stack"]:first-child
  > div[data-ui="Stack"]:nth-child(2)
  > div > div > fieldset > div[data-ui="Box"]{
    padding: 0 !important;
    border: none !important;

    > div > div:not(.image-field-wrapper) > div{
      padding: 1px !important;

      > div {
        padding: 0.5rem 0.75rem !important;

        > div {
          color: red !important;
          padding: 0 !important;

          > div:first-child {
            gap: 0.75rem !important;

            > div:first-child {
              padding-left: 0.25rem !important;
            }

            span {
              font-size: 0.8125rem !important;
              line-height: 1.46154 !important;
            }

            svg {
              width: 21px !important;
              height: 21px !important;
              font-size: 1.3125rem !important;
              margin: -0.375rem !important;
              transform: scale(0.9) !important;
            }
          }

          > div:nth-child(2) {
            display: flex !important;
            gap: 0.25rem !important;
            margin: 0 !important;

            > div {
              padding: 0 !important;
            }

            > div button > span {
              padding: 0.5rem !important;
              > span {
                gap: 0.5rem !important;
              }
            }

            > div:nth-child(3) {
              display: none !important;
            }
          }
        }
      }
    }
  }
`