import { useEffect, useState } from 'react'

import type { Ref } from '../types/media'
import { SANITY_CLIENT_OPTIONS } from '../../constants/configs'
import { prepareProjectId } from '../../utils/refs'
import { useClient } from 'sanity'

export const useProjectSlides = (projectRef?: Ref) => {
  const [isLoading, setIsLoading] = useState(true)
  const client = useClient(SANITY_CLIENT_OPTIONS)
  const [slides, setSlides] = useState<unknown>(null)

  const projectId = projectRef?._ref

  useEffect(() => {
    if (!projectId) return
    (async () => {
      try {
        const doc = await client.fetch<{ slides?: unknown } | null>(
          `*[_type == "project" && _id in $ids][0]{ slides }`,
          { ids: prepareProjectId(projectId) },
        )
        setSlides(doc?.slides)
      } catch (error) {
        throw error
      }
      setIsLoading(false)
    })()
  }, [client, projectId])

  return { isLoading, slides }
}