import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import prettier from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vueParser from "vue-eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 基础 JavaScript/TypeScript 配置
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      js,
      prettier,
      import: importPlugin,
      "simple-import-sort": simpleImportSort
    },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue']
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json'
        }
      }
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      indent: ['error', 'tab', { SwitchCase: 1 }],
      'no-tabs': ['off', { allowIndentationTabs: true }],
      'import/no-extraneous-dependencies': [0, { devDependencies: false, optionalDependencies: false, peerDependencies: false }],
      'consistent-return': [0, { treatUndefinedAsUnspecified: true }],
      'no-param-reassign': ['off', { props: false }],
      'no-shadow': ['off', { hoist: 'functions' }],
      'class-methods-use-this': 0,
      'no-restricted-syntax': 0,
      'no-plusplus': 0,
      'prefer-rest-params': 0,
      'no-unused-expressions': 0,
      'default-param-last': 0,
      'no-useless-escape': 0,
      'no-lonely-if': 1,
      'no-continue': 0,
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'prettier/prettier': 'error'
    }
  },
  // TypeScript 专用配置
  ...tseslint.configs.recommended,
  // Vue 文件配置
  {
    files: ["**/*.vue"],
    plugins: {
      vue: pluginVue,
      prettier,
      import: importPlugin,
      "simple-import-sort": simpleImportSort
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vue 3 Composition API 环境
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly'
      }
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
        'vue-eslint-parser': ['.vue']
      },
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue']
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json'
        }
      }
    },
    rules: {
      // Vue 3 核心规则
      'vue/multi-word-component-names': 0,
      'vue/return-in-computed-property': ['error', { treatUndefinedAsUnspecified: true }],
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-reserved-keys': 'off',
      'vue/no-mutating-props': 0,
      'vue/no-unused-vars': 'error',
      'vue/valid-template-root': 'error',
      'vue/no-multiple-template-root': 'off', // Vue 3 支持多个根节点
      'vue/no-v-model-argument': 'off', // Vue 3 支持 v-model 参数
      // 通用规则
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      indent: ['error', 'tab', { SwitchCase: 1 }],
      'no-tabs': ['off', { allowIndentationTabs: true }],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'prettier/prettier': 'error'
    }
  },
  // JSON 文件配置
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  { files: ["**/*.jsonc"], plugins: { json }, language: "json/jsonc", extends: ["json/recommended"] },
  { files: ["**/*.json5"], plugins: { json }, language: "json/json5", extends: ["json/recommended"] },
  // Markdown 文件配置
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/commonmark", extends: ["markdown/recommended"] },
  // CSS 文件配置
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
    rules: {
      "css/use-baseline": "off" // 允许使用非基线CSS属性
    }
  },
  // 忽略文件配置
  {
    ignores: ["node_modules", "dist", "build", "public"]
  }
]);
