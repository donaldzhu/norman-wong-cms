import {Button, Inline} from '@sanity/ui'
import {type ReactElement, useCallback} from 'react'
import {set, unset, type StringInputProps, type StringSchemaType} from 'sanity'

type ListOption = {title?: string; value: string} | string

/**
 * Renders a string field's `options.list` as a row of toggle buttons.
 * Only one option can be active at a time; clicking the active button leaves it on.
 */
export function ButtonToggleInput(props: StringInputProps<StringSchemaType>): ReactElement {
  const {value, onChange, readOnly, schemaType, elementProps} = props
  const list = (schemaType.options?.list ?? []) as ListOption[]

  const handleSelect = useCallback(
    (next: string) => {
      if (next === value) return
      onChange(next ? set(next) : unset())
    },
    [onChange, value],
  )

  return (
    <Inline space={2} data-ui="ButtonToggleInput">
      {list.map(item => {
        const optionValue = typeof item === 'string' ? item : item.value
        const optionTitle = typeof item === 'string' ? item : (item.title ?? item.value)
        const selected = value === optionValue

        return (
          <Button
            key={optionValue}
            id={`${elementProps.id}-${optionValue}`}
            text={optionTitle}
            mode={selected ? 'default' : 'ghost'}
            tone={selected ? 'primary' : 'default'}
            disabled={readOnly}
            onClick={() => handleSelect(optionValue)}
            type="button"
          />
        )
      })}
    </Inline>
  )
}
