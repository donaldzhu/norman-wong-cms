import { defineField, defineType } from 'sanity'

import { UserIcon } from '@sanity/icons'
import { TextLength } from '../../../constants/configs'

export const contact = defineType({
  name: 'contact',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'displayName',
      type: 'string',
      validation: rule => rule.max(TextLength.SHORT),
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: rule => rule.required().email().max(TextLength.TINY),
    }),
    defineField({
      name: 'phone',
      type: 'string',
      validation: rule => rule.max(TextLength.TINY),
    }),
  ],
  preview: {
    select: {
      displayName: 'displayName',
      email: 'email',
      phone: 'phone',
    },
    prepare({ displayName, email, phone }) {
      return {
        title: displayName,
        subtitle: `${email} ${phone ? `· ${phone}` : ''}`,
      }
    },
  },
})
