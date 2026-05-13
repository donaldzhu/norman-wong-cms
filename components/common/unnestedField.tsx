import type { ObjectFieldProps } from 'sanity'

export const UnnestedField = (
  props: ObjectFieldProps,
) => props.renderDefault({ ...props, level: 0 })

