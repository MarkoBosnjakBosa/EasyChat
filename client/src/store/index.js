import Vuex from "vuex";
import Axios from "axios";
import createPersistedState from "vuex-persistedstate";

const getDefaultState = () => {
	return {
		token: "",
		user: "",
		isAdmin: false
	};
};

export default new Vuex.Store({
	strict: true,
	plugins: [createPersistedState()],
	state: getDefaultState(),
	getters: {
		isLoggedIn: state => { return state.token; },
		getUser: state => { return state.user; },
		isAdmin: state => { return state.isAdmin; }
	},
	mutations: {
		SET_TOKEN: (state, token) => { state.token = token; },
		SET_USER: (state, user) => { state.user = user; },
		SET_ADMIN: (state, isAdmin) => { state.isAdmin = isAdmin },
		RESET: state => { Object.assign(state, getDefaultState()); }
	},
	actions: {
		login: ({commit}, {token, user, isAdmin}) => {
			commit("SET_TOKEN", token);
			commit("SET_USER", user);
			commit("SET_ADMIN", isAdmin);
			Axios.defaults.headers.common["Authorization"] = "Bearer " + token;
		},
		logout: ({commit}) => {
			commit("RESET", "");
		}
	}
});
