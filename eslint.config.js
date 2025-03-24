const { defineConfig } = require('eslint/config');
const { includeIgnoreFile } = require('@eslint/compat');
const path = require('node:path');
const globals = require('globals');

const gitignorePath = path.resolve(__dirname, '.gitignore');

const js = require('@eslint/js');
const babelParser = require('@babel/eslint-parser');
const reactPlugin = require('eslint-plugin-react');
const jestPlugin = require('eslint-plugin-jest');

module.exports = defineConfig([
  includeIgnoreFile(gitignorePath), // Load ignores from .gitignore
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        requireConfigFile: false
      },
      globals: {
        ...globals.builtin,
        ...globals.browser,
        ...globals.es6,
        ...globals.node,
      }
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'indent': ['error', 2, { 'SwitchCase': 1 }],
      'linebreak-style': ['error', 'unix'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'space-in-parens': ['error', 'never'],
      'no-multiple-empty-lines': 'warn',
      'prefer-const': 'error',
      'space-infix-ops': 'error',
      'no-useless-escape': 'off',
      'require-atomic-updates': 'off',
      'react/jsx-uses-vars': 'warn',
      'react/jsx-uses-react': 'warn',
      'react/react-in-jsx-scope': 'warn',
      'no-console': 'off',
      'no-case-declarations': 'off',
      'quotes': ['error', 'single'],
      'no-var': 'error',
      'no-prototype-builtins': 'off',
      'curly': ['error', 'all'],
      'react/no-deprecated': 'off',
      'react/prop-types': 'off',
      'react/no-string-refs': 'off',
    }
  },
  {
    files: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
    plugins: {
      jest: jestPlugin
    },
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.browser,
        ...globals.es6,
        ...globals.node,
        ...globals.jest
      }
    },
  }
]);
