/** Span row inside a Sanity `_type: 'block'` text node. */
export interface PortableTextSpan {
  readonly _type?: string
  readonly text?: string
}

/** Sanity portable text block (paragraph, heading, etc.). */
export interface PortableTextBlock {
  readonly _type: 'block'
  readonly children?: readonly PortableTextSpan[]
}

export const isPortableTextBlock = (node: unknown): node is PortableTextBlock => {
  if (typeof node !== 'object' || node === null) return false
  const o = node as { _type?: unknown; children?: unknown }
  return o._type === 'block' && Array.isArray(o.children)
}

export const plainTextFromBlocks = (blocks: unknown): string => {
  if (!Array.isArray(blocks)) return ''
  const parts: string[] = []
  for (const node of blocks) {
    if (!isPortableTextBlock(node)) continue
    for (const child of node.children ?? []) {
      if (child.text) parts.push(child.text)
    }
  }
  return parts.join('').trim()
}
