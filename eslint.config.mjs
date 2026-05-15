import studio from '@sanity/eslint-config-studio'

const unusedVarsOptions = { args: 'none', ignoreRestSiblings: true }

// Build globs without a literal `/*` in this file — some tooling mis-treats that
// as the start of a block comment and breaks loading the config in the IDE.
const allJsFiles = '**/' + '*.{js,mjs,cjs,jsx}'
const allTsFiles = '**/' + '*.{ts,tsx}'

export default [
  ...studio,
  {
    files: [allJsFiles],
    rules: {
      'no-unused-vars': ['error', unusedVarsOptions],
    },
  },
  {
    files: [allTsFiles],
    languageOptions: {
      parserOptions: {
        // Required for rules like `prefer-nullish-coalescing` / `prefer-optional-chain`
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'typescript/no-unused-vars': ['error', unusedVarsOptions],
      'typescript/no-explicit-any': 'warn',
      'typescript/prefer-nullish-coalescing': 'warn',
      'typescript/prefer-optional-chain': 'warn',
      'typescript/consistent-type-definitions': 'warn',
    },
  },
]
