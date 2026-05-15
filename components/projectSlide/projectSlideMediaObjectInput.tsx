import { Stack } from '@sanity/ui'
import { useEffect, useMemo } from 'react'
import { set, useFormValue, type ObjectInputProps } from 'sanity'

import styled from 'styled-components'
import {
  MOBILE_LANDSCAPE_COLUMN_COUNT,
  MOBILE_PORTRAIT_ROW_COUNT,
} from './projectSlideGrid/configs'
import { Orientation } from '../../constants/enum'

type MobileOrientation = 'portrait' | 'landscape'

type ProjectSlideMediaValue = {
  desktopStart?: number
  desktopEnd?: number
  mobileStart?: number
  mobileEnd?: number
}

export const ProjectSlideMediaObjectInput = (
  props: ObjectInputProps<ProjectSlideMediaValue>,
) => {
  const { renderDefault, value, onChange, path } = props

  const slidePathPrefix = useMemo(() => {
    const i = path.indexOf('media')
    if (i < 1) return null
    return path.slice(0, i)
  }, [path])

  const slideAutomaticMobile = useFormValue(
    slidePathPrefix ? [...slidePathPrefix, 'automaticMobileLayout'] : [],
  ) as boolean | undefined
  const slideMobileOrientation = useFormValue(
    slidePathPrefix ? [...slidePathPrefix, 'mobileOrientation'] : [],
  ) as string | undefined

  const mobileOrientation: MobileOrientation =
    slideMobileOrientation === Orientation.LANDSCAPE ? 'landscape' : 'portrait'
  const mobileCellCount =
    mobileOrientation === 'portrait' ? MOBILE_PORTRAIT_ROW_COUNT : MOBILE_LANDSCAPE_COLUMN_COUNT
  const mobileEndEdgeMax = mobileCellCount + 1

  useEffect(() => {
    if (slideAutomaticMobile !== false || !slidePathPrefix) return

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
    slideAutomaticMobile,
    slideMobileOrientation,
    mobileCellCount,
    mobileEndEdgeMax,
    onChange,
    slidePathPrefix,
    value?.mobileEnd,
    value?.mobileStart,
  ])

  return (
    <StyledStack space={2}>
      {renderDefault(props)}
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
