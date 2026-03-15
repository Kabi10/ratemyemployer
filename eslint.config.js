const js = require('@eslint/js');
const nextPlugin = require('@next/eslint-plugin-next');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: [
      '.next/**/*',
      'deploy/.next/**/*',
      'deploy/**/*',
      'out/**/*',
      'node_modules/**/*',
      '.vercel/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      '*.config.js',
      '*.config.mjs',
      'src/env.mjs',
      'schema.ts',
      'scripts/**/*',
      'src/__tests__/**/*',
      'src/scripts/**/*',
      'src/lib/webScraping/**/*',
      'src/lib/analysis/**/*',
      'temp/**/*'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': typescriptPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        NodeJS: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        console: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSpanElement: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        alert: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly'
      }
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off'
    },
  },
]; 