import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';

const TS_FILES = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];
const JS_FILES = ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.jsx'];

const ANGULAR_TS_FILES = ['packages/angular/**/*.ts'];
const ANGULAR_TEMPLATE_FILES = ['packages/angular/**/*.html'];

const REACT_FILES = ['packages/react/**/*.{ts,tsx,js,jsx}', 'demo/**/*.{ts,tsx,js,jsx}'];

const SVELTE_FILES = [
  'packages/svelte/**/*.svelte',
  'packages/svelte/**/*.svelte.ts',
  'packages/svelte/**/*.svelte.js',
  'demo/**/*.svelte',
  'demo/**/*.svelte.ts',
  'demo/**/*.svelte.js'
];

const BROWSER_FILES = [
  'common/test/**/*.{ts,js,mts,cts}',
  'packages/core/src/**/*.{ts,mts,cts}',
  'packages/svelte/**/*.{ts,js,mts,cts,svelte}',
  'packages/angular/**/*.{ts,js,mts,cts}',
  'packages/react/**/*.{ts,js,mts,cts,tsx,jsx}',
  'demo/**/*.{ts,js,mts,cts,svelte}'
];

const NODE_FILES = [
  'eslint.config.js',
  'scripts/**/*.{js,mjs,cjs,ts,mts,cts}',
  'packages/*/scripts/**/*.{js,mjs,cjs,ts,mts,cts}',
  '**/vite.config.{js,mjs,cjs,ts,mts,cts}',
  '**/vitest.config.{js,mjs,cjs,ts,mts,cts}',
  '**/vitest.*.config.{js,mjs,cjs,ts,mts,cts}',
  '**/playwright.config.{js,mjs,cjs,ts,mts,cts}',
  'packages/svelte/src/lib/server.ts',
  'packages/svelte/src/lib/vite.ts',
  'packages/react/src/lib/server.ts',
  'packages/react/src/lib/vite.ts',
  'packages/angular/server/**/*.ts'
];

const svelteRecommendedRules = Object.assign(
  {},
  ...svelte.configs['flat/recommended'].map((config) => config.rules ?? {})
);

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.angular/**',
      '**/.output/**',
      '**/.vercel/**',
      '**/.svelte-kit/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/playwright-report/**',
      '.playwright-cli/**',
      '**/*.min.js',
      '**/*.min.css',
      'pnpm-lock.yaml',
      'examples/**'
    ]
  },

  js.configs.recommended,

  {
    files: TS_FILES,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.es2021
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },

  {
    files: BROWSER_FILES,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    }
  },

  {
    files: NODE_FILES,
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    }
  },

  {
    files: REACT_FILES,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    plugins: { 'react-hooks': reactHooks },
    settings: {
      react: { version: 'detect' }
    },
    rules: { ...reactHooks.configs.recommended.rules }
  },

  ...angular.configs.tsRecommended.map((config) => ({
    ...config,
    files: ANGULAR_TS_FILES
  })),

  {
    files: ANGULAR_TS_FILES,
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@angular-eslint/no-output-rename': 'off'
    }
  },

  ...angular.configs.templateRecommended.map((config) => ({
    ...config,
    files: ANGULAR_TEMPLATE_FILES
  })),

  ...angular.configs.templateAccessibility.map((config) => ({
    ...config,
    files: ANGULAR_TEMPLATE_FILES
  })),

  {
    files: SVELTE_FILES,
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    plugins: {
      svelte,
      '@typescript-eslint': typescript
    },
    rules: {
      ...svelteRecommendedRules,
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },

  {
    files: JS_FILES,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2021
      }
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-useless-escape': 'warn'
    }
  },

  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.vitest
      }
    },
    rules: {
      'no-undef': 'off'
    }
  },

  // Prettier config (must be last)
  prettier
];
