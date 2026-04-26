import { defineField, defineType } from 'sanity'

import { UserIcon } from '@sanity/icons'

export const contact = defineType({
  name: 'contact',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'displayName',
      type: 'string',
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: rule => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      type: 'string',
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
