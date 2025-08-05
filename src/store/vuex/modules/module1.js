const state = {
	module1State: 1
}

const mutations = {
	UPDATE_STATE: (state) => {
		state.module1State++
	}
}

const actions = {
	async updateState({ commit }) {
		return new Promise(async (resolve) => {
			commit('UPDATE_STATE')
			resolve(true)
		})
	}
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
