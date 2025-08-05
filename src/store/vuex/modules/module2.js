const state = {
	module2State: 2
}

const mutations = {
	UPDATE_STATE: (state) => {
		state.module2State++
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
