import { Button, Inline } from '@sanity/ui'
import { useCallback } from 'react'
import { set, unset, type StringInputProps, type StringSchemaType } from 'sanity'

type ListOption = { title?: string; value: string } | string


export const ButtonToggleInput = (props: StringInputProps<StringSchemaType>) => {
  const { value, onChange, readOnly, schemaType, elementProps } = props
  const list = (schemaType.options?.list ?? []) as ListOption[]

  const handleSelect = useCallback(
    (next: string) => {
      if (next === value) return
      onChange(next ? set(next) : unset())
    },
    [onChange, value],
  )

  return (
    <Inline space={2}>
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
            style={{
              cursor: 'pointer',
            }}
          />
        )
      })}
    </Inline>
  )
}
