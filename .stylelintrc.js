module.exports = {
	extends: [
		'stylelint-config-standard-scss',
		'stylelint-config-standard-vue/scss',
		'stylelint-config-recess-order',
		'stylelint-prettier/recommended'
	],
	overrides: [
		{
			files: ['**/*.(scss|css|vue|html)'],
			customSyntax: 'postcss-scss'
		},
		{
			files: ['**/*.(html|vue)'],
			customSyntax: 'postcss-html'
		}
	],
	ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts', '**/*.json', '**/*.md', '**/*.yaml', 'node_modules/*', 'dist/*', 'public/*'],
	rules: {
		'selector-class-pattern': null, // class 名称规则 (默认 短横线)
		'scss/at-import-partial-extension': null, // scss @import 导入语句 (默认不要后缀名 .scss)
		'keyframes-name-pattern': null, // keyframe 名称规则 (默认 短横线)
		'scss/dollar-variable-pattern': null, // scss 变量 名称规则 (默认 短横线)
		'selector-id-pattern': null, // id 选择器 名称规则 (默认 短横线)
		'scss/at-mixin-pattern': null, // mixin 名称规则 (默认 短横线)
		'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'deep'] }], // 不能有未知的选择器 (添加 global, deep)
		'scss/dollar-variable-colon-space-before': null, // 变量名后冒号前的空格 (默认 不要空格)
		'scss/at-extend-no-missing-placeholder': null, // @extend 指令后缺失占位符 (默认需要将 # 和 . 替换为 %)
		'no-descending-specificity': [true, { severity: 'warning' }], // 优先级高的选择器需要在优先级低的选择器后面，调整成 警告 级别
		'property-no-vendor-prefix': [true, { severity: 'warning', disableFix: true }], // 属性名，默认禁止使用浏览器引擎前缀的属性 -webkit-、-moz-
		'value-no-vendor-prefix': [true, { severity: 'warning', disableFix: true }], // 属性值，默认禁止使用浏览器引擎前缀的属性 -webkit-、-moz-
		'value-keyword-case': null, // scss 变量 的 值 名称规则 (默认小写)
		'font-family-no-missing-generic-family-keyword': [true, { ignoreFontFamilies: ['iconfont'] }], // 自定义 font 名称
		'color-function-notation': 'legacy', // 颜色声明风格
		'alpha-value-notation': 'number', // 数值风格
		'declaration-block-no-redundant-longhand-properties': [true, { ignoreShorthands: ['/top|bottom|left|right|inset/'] }] // 属性声明合并 (top, left, right, bottom 会被 简写成 inset, 忽略这一条)
	}
}
