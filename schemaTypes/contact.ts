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
      description: 'Label shown for this contact (e.g. studio name or role).',
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: rule => rule.required().email(),
      description: 'Required. Used for mailto links and display.',
    }),
    defineField({
      name: 'phone',
      type: 'string',
      description: 'Optional. Include country code if relevant.',
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
        title: displayName || email || 'Contact',
        subtitle: `${email} ${phone ? `· ${phone}` : ''}`,
      }
    },
  },
})
