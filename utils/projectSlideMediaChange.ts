import { PatchEvent, set, type FormPatch } from 'sanity'
import type { ProjectSlideFormValue } from '../components/types/media'

// Append mode changes to the same local edit as the media addition. Opening a
// document or receiving a remote update must never trigger a repair write.
export function projectSlideMediaChange(value: ProjectSlideFormValue | undefined, event: PatchEvent): PatchEvent {
  if (value?.layoutV2?.version !== 2) return event
  let keys = (value.media ?? []).map(item => item._key)
  let changed = false
  for (const patch of event.patches) {
    if (patch.path[0] !== 'media') continue
    if (patch.path.length === 1) {
      if (patch.type === 'set' || (patch.type === 'setIfMissing' && !value.media)) {
        if (!Array.isArray(patch.value)) continue
        keys = patch.value.map(item => (item as { _key?: string })._key ?? '')
        changed = true
      } else if (patch.type === 'unset') {
        keys = []
        changed = true
      }
    } else if (patch.path.length === 2) {
      const selector = patch.path[1]
      const index = typeof selector === 'number'
        ? selector < 0 ? keys.length + selector : selector
        : typeof selector === 'object' && '_key' in selector ? keys.indexOf(selector._key) : -1
      if (patch.type === 'unset' && index >= 0) {
        keys.splice(index, 1)
        changed = true
      } else if (patch.type === 'insert') {
        const at = patch.position === 'after' ? index + 1 : Math.max(0, index)
        keys.splice(at, 0, ...patch.items.map(item => (item as { _key?: string })._key ?? ''))
        changed = true
      }
    }
  }
  if (!changed || keys.length <= 1) return event
  const patches: FormPatch[] = []
  for (const view of ['desktop', 'mobile'] as const) {
    if (value.layoutV2[view]?.mode === 'justify') patches.push(set('center', ['layoutV2', view, 'mode']))
  }
  return patches.length ? event.append(patches) : event
}
