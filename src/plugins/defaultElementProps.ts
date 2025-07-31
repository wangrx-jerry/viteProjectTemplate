import { ElButton, ElCascader, ElDialog, ElInput, ElSelect } from 'element-plus'

// 全局按钮默认圆角
ElButton.props.round = {
	type: Boolean,
	default: true
}
// 全局textarea高度默认一行，最高三行
ElInput.props.autosize = {
	type: [Boolean, Object],
	default: () => ({ minRows: 1, maxRows: 3 })
}
// 全局弹窗居中展示
ElDialog.props.alignCenter = {
	type: Boolean,
	default: true
}
// 全局弹窗可拖拽
ElDialog.props.draggable = {
	type: Boolean,
	default: true
}
// 拖动范围可以超出可视区
ElDialog.props.overflow = {
	type: Boolean,
	default: true
}
// 弹窗点击 model 不可关闭
ElDialog.props.closeOnClickModal = {
	type: Boolean,
	default: false
}
// 全局弹窗关闭时销毁
ElDialog.props.destroyOnClose = {
	type: Boolean,
	default: true
}
// 全局按钮默认圆角
ElSelect.props.tagType = {
	type: String,
	default: ''
}
// 全局按钮默认圆角
ElCascader.props.tagType = {
	type: String,
	default: ''
}
