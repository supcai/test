import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    token: '',
    empAccount: '',
    empName: '',
    sideMenu: [],
    activeMenu: '',
    spread: '',
    layout: '',
    featureList: []
  },
  mutations: {
    // window ready
    updateWindowReady (state, status) {
      state.windowReady = status
    },
    updateEmpInfo (state, obj) {
      state.token = obj.token
      state.empAccount = obj.empAccount
      state.empName = obj.empName
    },
    updateSideMenu (state, obj) {
      state.sideMenu = obj
    },
    changeMenu (state, menuCode) {
      state.activeMenu = menuCode
    },
    isCollapse (state, spreadState) {
      state.spread = spreadState
    },
    updateLayout (state, layout) {
      state.layout = layout
    },
    // 菜单功能列表
    updateFeatureList (state, obj) {
      state.featureList = obj
    }
  }
})
