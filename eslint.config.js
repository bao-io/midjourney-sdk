import { antfu } from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-useless-call': 'off',
    'no-console': 'off',
    'node/prefer-global/process': 'off',
    'ts/ban-ts-comment': 'off',
    'no-unused-expressions': 'off',
    'no-sequences': 'off',
    'prefer-promise-reject-errors': 'off',
  },
})
