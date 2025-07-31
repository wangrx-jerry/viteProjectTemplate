import { AxiosResponse } from 'axios'

import { isEmpty } from '@/assets/utils/common'

export function transferResponse<T extends Elink.AnyObject | number | string>(response: AxiosResponse<T>) {
	return new Promise<T>((resolve, reject) => {
		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		if ((response as Elink.AnyObject)?.data || !isEmpty((response as Elink.AnyObject)?.data)) {
			return resolve(response.data)
		} else {
			return reject(response)
		}
	})
}
