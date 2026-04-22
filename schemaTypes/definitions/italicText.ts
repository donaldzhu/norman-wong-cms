/** Shared block config: paragraph text with italic enabled (no headings/lists). */
export const italicTextBlock = {
  type: 'block',
  styles: [],  // Remove style dropdown (no H1, H2, etc)
  lists: [],   // Remove list options
  marks: {
    decorators: [
      { title: 'Italics', value: 'em' }
    ],
    annotations: []  // Remove link option
  },
  options: {
    oneLine: true  // This prevents hitting return!
  }
} as const
