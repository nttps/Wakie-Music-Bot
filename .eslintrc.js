module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['plugin:prettier/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {},
}
