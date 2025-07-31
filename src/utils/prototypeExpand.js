// hack tofixed 精度计算问题（1.555.toFixed(2)=>1.55）
// eslint-disable-next-line no-extend-native
import { Decimal } from 'decimal.js'

Number.prototype.toFixed = function (point) {
	const value = this.valueOf()
	return new Decimal(value).toFixed(point)
	// if (typeof point !== 'number') point = 0
	// const num = this.valueOf()
	// let param = 0.5
	// if (num < 0) param = -0.5
	// const times = Math.pow(10, point)
	// let result = num * times + param
	// result = parseInt(result, 10) / times
	// return result + ''
}

// Array.prototype.at = function (index) {
// 	if (typeof index !== 'number') {
// 		console.error('at index need number type')
// 		return
// 	}
// 	const value = this.valueOf()
// 	return value.slice(index)[0]
// }
