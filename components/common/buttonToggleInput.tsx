import { Button, Inline } from '@sanity/ui'
import { set, unset, type StringInputProps, type StringSchemaType } from 'sanity'

type ListOption = { title?: string; value: string } | string


export const ButtonToggleInput = (props: StringInputProps<StringSchemaType>) => {
  const { value, onChange, readOnly, schemaType } = props
  const list = (schemaType.options?.list ?? []) as ListOption[]

  const handleSelect = (next: string) => {
    if (next !== value) onChange(next ? set(next) : unset())
  }

  return (
    <Inline gap={2}>
      {list.map(item => {
        const optionValue = typeof item === 'string' ? item : item.value
        const optionTitle = typeof item === 'string' ? item : (item.title ?? item.value)
        const selected = value === optionValue
        return (
          <Button
            key={optionValue}
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
