const TYPE_MAP: Record<string, string> = {
  selectedWorks: 'allProjects',
  allProjects: 'selectedWorks',
  selectedWorksProject: 'allProjectsProject',
  selectedWorksMedia: 'allProjectsMedia',
  selectedWorksLayout: 'allProjectsLayout',
  allProjectsThumbnail: 'selectedWorksThumbnail',
}

export function transformTypes<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => transformTypes(item)) as T
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const result: Record<string, unknown> = {}

    for (const [key, val] of Object.entries(obj)) {
      if (key === '_type' && typeof val === 'string' && TYPE_MAP[val]) {
        result[key] = TYPE_MAP[val]
      } else {
        result[key] = transformTypes(val)
      }
    }

    return result as T
  }

  return value
}

export function stripSanityMeta(doc: Record<string, unknown>) {
  const {_rev, _createdAt, _updatedAt, ...rest} = doc
  return rest
}
