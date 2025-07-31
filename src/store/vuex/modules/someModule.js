const state = {
	someState: 11
}

const mutations = {
	UPDATE_STATE: (state, navbar) => {
		state.someState++
	}
}

const actions = {
	async updateState({ commit, state }, view) {
		return new Promise(async (resolve) => {
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
