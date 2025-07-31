import { Dayjs } from 'dayjs'

declare module 'dayjs' {
	export default function (date?: dayjs.ConfigType, format?: dayjs.OptionType, locale?: string, strict?: boolean): Dayjs
}

declare global {
	declare namespace Elink {
		type Key = string | number | boolean

		type AnyObject = Record<string, any>

		interface OptionItem<T = any> {
			label: string
			value: T
		}

		type OptionList<T = any> = OptionItem<T>[]

		type ObjectType<T> = {
			[k in keyof T]: T[k]
		}

		type ListReq<T extends Record<string, any> = {}> = ObjectType<
			T & {
				pageNum?: number
				pageSize?: number
			}
		>

		type ListRes<ListItem extends Record<string, any> = {}, ExtraData extends Record<string, any> = {}> = ObjectType<
			{
				list: ListItem[]
				total: number
			} & ExtraData
		>

		/** 默认为
		 * {
		 *   label: string
		 *   value: any
		 *   children?: NormalTreeData<T>[]
		 * }
		 */
		type NormalTreeData<T = Elink.OptionItem> = T & {
			children?: NormalTreeData<T>[]
		}

		interface ImgVO {
			name?: string
			url: string
			[property: string]: any
		}
	}
}
