import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
  },
  getters: {
    user: state => state.user,
  },
  actions: {
    //
  },
  mutations: {
    SET_USER: (state, data) => {
      state.user = data;
    },
  },
});