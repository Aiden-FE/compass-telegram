module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ["prettier"],
  extends: [
    '@compass-aiden/eslint-config/ts',
    'plugin:prettier/recommended'
  ],
  rules: {
    "prettier/prettier": "error"
  },
}
