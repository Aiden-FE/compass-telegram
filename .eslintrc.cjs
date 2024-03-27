module.exports = {
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.*.json'],
  },
  ignorePatterns: ['.eslintrc.cjs', 'dist', 'types'],
  extends: [
    // typescript使用此配置
    '@compass-aiden/eslint-config/ts',
    'plugin:prettier/recommended',
  ],
};
