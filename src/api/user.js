import { get, post } from './request'

export function login(data) {
	return post({
		url: '/client-api/auth/login',
		data,
		extraConfig: {
			cancelPreviousRequest: true
		}
	})
}

export function getInfo({ roleId, companyId, supplierSecondType }) {
	return get({
		url: '/client-api/auth/getInfo',
		params: { roleId, companyId, supplierSecondType },
		extraConfig: {
			cancelPreviousRequest: true
		}
	})
}

export function signUp(data) {
	return post({
		url: '/client-api/auth/register',
		data,
		extraConfig: {
			cancelPreviousRequest: true
		}
	})
}

export function getRoleInfo() {
	return get({
		url: '/client-api/auth/supplierRoles',
		extraConfig: {
			cancelPreviousRequest: true
		}
	})
}

export function logout() {
	return post({
		url: '/client-api/auth/logout',
		extraConfig: {
			cancelPreviousRequest: true
		}
	})
}

export function getSystemPermission(tenantId) {
	return post({
		url: '/orgPermission/permissionQueryV2',
		data: { tenantId },
		extraConfig: {
			cancelPreviousRequest: true
		}
	})
}
