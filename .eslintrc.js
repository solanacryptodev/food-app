module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'airbnb'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
  },
  plugins: [
  ],
  rules: {
    "indent": 'off',
    "linebreak-style": 'off',
    "brace-style": 'off',
    "no-trailing-spaces": 'off',
    "no-console": 'off',
    "no-alert": 'off',
    "import/prefer-default-export": 'off'
  },
};
