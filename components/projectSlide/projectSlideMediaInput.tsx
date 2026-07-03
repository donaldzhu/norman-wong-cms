import { Stack } from '@sanity/ui'
import { type ObjectInputProps } from 'sanity'

import styled from 'styled-components'

export const ProjectSlideMediaInput = (
  props: ObjectInputProps,
) => (
  <StyledStack gap={2}>
    {props.renderDefault(props)}
  </StyledStack>
)

const StyledStack = styled(Stack)`
  > div[data-ui="Stack"]:first-child
  > div[data-ui="Stack"]:nth-child(2)
  > div > div > fieldset > div[data-ui="Box"],
  > div[data-ui="Stack"]:first-child
  > div[data-ui="Stack"]:nth-child(5)
  > div > div > fieldset > div[data-ui="Box"],
  > div[data-ui="Stack"]:first-child
  > div[data-ui="Stack"]:nth-child(6)
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
