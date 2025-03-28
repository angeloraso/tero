import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularParser from '@angular-eslint/template-parser';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  ...compat.extends('plugin:@angular-eslint/recommended'),
  {
    ignores: ['node_modules/', 'dist/', '.angular/', 'android/', 'public/', 'resources/', 'functions/']
  },
  {
    files: ['*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['tsconfig.json'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angular,
      prettier,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prettier/prettier': [
        'error',
        {
          tabWidth: 2,
          useTabs: false,
          singleQuote: true,
          semi: true,
          bracketSpacing: true,
          arrowParens: 'avoid',
          trailingComma: 'none',
          bracketSameLine: true,
          printWidth: 150,
          endOfLine: 'auto'
        },
      ],
    },
  },
  {
    files: ['*.html'],
    languageOptions: {
      parser: angularParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {},
  },
];
