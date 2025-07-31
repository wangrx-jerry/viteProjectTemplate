/* 系统通用接口 */
import axios from '@/api/axiosSetting'

import { transferResponse } from './requestUtils'

export function upgradeTemplate(params, extraConfig) {
	return axios.post('/client-api/development/template/upgradeTemplate', params, extraConfig).then(transferResponse)
}
