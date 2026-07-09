import { defineField, defineType } from 'sanity'

import { DocumentIcon } from '@sanity/icons'
import { MediaRefPreview } from '../../components/previews/mediaRefPreview'
import { MediaType } from '../../constants/enum'
import { ProjectDocumentPreview } from '../../components/previews/projectDocumentPreview'
import { TextLength } from '../../constants/configs'

export const project = defineType({
  name: 'project',
  type: 'document',
  icon: DocumentIcon,
  components: {
    preview: ProjectDocumentPreview,
  },
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: rule => rule.required().max(TextLength.TINY),
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      validation: rule => rule.max(TextLength.SHORT),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'This is the URL subpath for the project.',
      options: {
        source: doc => `${doc.title}${doc.subtitle ? `- ${doc.subtitle}` : ''}`.toLowerCase().replace(/ /g, '-'),
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'slides',
      title: 'Project slides',
      type: 'array',
      of: [{ type: 'projectSlide' }],
    }),
    defineField({
      name: 'selectedWorksThumbnails',
      title: '"Selected Works" Thumbnails',
      type: 'array',
      of: [{ type: 'selectedWorksThumbnail' }],
      /*  validation: rule => rule
         .min(1) //TODO
         .max(10)
         .custom(thumbnails => {
           if (!thumbnails?.length) return true
 
           const showingOnMobileCount = (thumbnails as { hideOnMobile?: boolean }[]).filter(
             thumbnail => !thumbnail.hideOnMobile,
           ).length
 
           if (showingOnMobileCount < 5) return 'Must have at least 5 thumbnails showing on mobile.'
           if (showingOnMobileCount > 7) return 'Must have at most 7 thumbnails showing on mobile.'
 
           return true
         }), */
      hidden: true,
    }),
  ],
  // TODO: other preview selects should follow this
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      slides: 'slides',
      mediaType: 'slides.0.media.0.mediaType',
      image: 'slides.0.media.0.image',
      video: 'slides.0.media.0.video',
    },
    prepare({ title, subtitle, slides, mediaType, image, video }) {
      const mediaWithRef = mediaType === MediaType.IMAGE ? image : video

      return {
        title,
        subtitle,
        slides,
        media:
          mediaType === MediaType.IMAGE && image
            ? image
            : mediaWithRef ? (
              <MediaRefPreview
                mediaWithRef={mediaWithRef}
                mediaType={mediaType}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : undefined,
      }
    },
  },
})
