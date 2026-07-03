import {at, defineMigration, set} from 'sanity/migrate'

import {MediaType} from '../../constants/enum'

/**
 * Sets unset `mobileMediaType` on project slide media items to `'image'`.
 *
 * Dry run (default):
 *   npx sanity migrations run set-mobile-media-type-default
 *
 * Apply to production:
 *   npx sanity migrations run set-mobile-media-type-default --no-dry-run --no-confirm
 */
export default defineMigration({
  title: 'Set unset mobileMediaType to image on project slide media',
  documentTypes: ['project'],
  filter: 'count(slides[].media[!defined(mobileMediaType)]) > 0',

  migrate: {
    object(node) {
      if (node._type === 'projectSlideMedia' && !('mobileMediaType' in node)) {
        return at('mobileMediaType', set(MediaType.IMAGE))
      }
    },
  },
})
