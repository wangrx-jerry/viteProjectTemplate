module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
		'vue/setup-compiler-macros': true
	},
	extends: ['plugin:vue/vue3-recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		},
		extraFileExtensions: ['.vue']
	},
	plugins: ['vue', '@typescript-eslint', 'simple-import-sort', 'import'],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx']
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
				project: './tsconfig.json'
			}
		}
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'no-tabs': ['off', { allowIndentationTabs: true }],
		'vue/multi-word-component-names': 0,
		'import/no-extraneous-dependencies': [0, { devDependencies: false, optionalDependencies: false, peerDependencies: false }],
		'consistent-return': [0, { treatUndefinedAsUnspecified: true }], // 函数是否必须有个ruturn
		'vue/return-in-computed-property': ['error', { treatUndefinedAsUnspecified: true }], // 计算属性必须有个return
		'no-param-reassign': ['off', { props: false }], // 允许修改函数参数的属性值
		'no-shadow': ['off', { hoist: 'functions' }], // 禁止变量声明覆盖外层作用域的变量
		'class-methods-use-this': 0,
		'no-restricted-syntax': 0,
		'no-plusplus': 0,
		'prefer-rest-params': 0,
		'vuejs-accessibility/click-events-have-key-events': 0,
		'no-unused-expressions': 0,
		'default-param-last': 0,
		'no-useless-escape': 0,
		'no-lonely-if': 1,
		'no-continue': 0,
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/member-delimiter-style': [
			'error',
			{
				multiline: {
					delimiter: 'none'
				},
				singleline: {
					delimiter: 'comma'
				}
			}
		],
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/promise-function-async': 'off',
		'@typescript-eslint/array-type': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/strict-boolean-expressions': 'off',
		'@typescript-eslint/consistent-type-assertions': 'off',
		'vue/attribute-hyphenation': 'off',
		'vue/v-on-event-hyphenation': 'off',
		'vue/require-default-prop': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		indent: 'off',
		'vue/no-reserved-keys': 'off',
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
		'import/no-unresolved': 'error', // 确保导入指向可解析的文件/模块
		'import/no-duplicates': 'error', // 合并同一文件的 import 语句。（大多数情况下，可自动修复）
		'import/newline-after-import': 'error', // 确保导入后有一个换行符。（可自动修复）
		'simple-import-sort/imports': 'error', // eslint-plugin-simple-import-sort 导入排序规则
		'simple-import-sort/exports': 'error', // eslint-plugin-simple-import-sort 导出排序规则
		'vue/no-mutating-props': 0 // 允许对props对象调整
	}
}
