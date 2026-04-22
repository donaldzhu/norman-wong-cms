import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'

export const contact = defineType({
  name: 'contact',
  title: 'Contact',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'displayName',
      title: 'Display name',
      type: 'string',
      description: 'Label shown for this contact (e.g. studio name or role).',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
      description: 'Required. Used for mailto links and display.',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description: 'Optional. Include country code if relevant.',
    }),
  ],
  preview: {
    select: {
      displayName: 'displayName',
      email: 'email',
    },
    prepare({displayName, email}) {
      return {
        title: displayName || email || 'Contact',
        subtitle: displayName ? email : undefined,
      }
    },
  },
})
