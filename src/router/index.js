import Vue from 'vue'
import Router from 'vue-router'
import store from '../store/index'
import {cookie, profiles} from '../assets/js/config'
import api from '../assets/js/api'
import notFund from '@/view/404'
import notAuth from '@/view/401'

import model from './model'
import variable from './variable'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'index',
      meta: {
        requireAuth: false,
        title: '首页'
      },
      component: require('@/view/index').default
    },
    ...model,
    ...variable,
    {
      path: '/401',
      meta: {
        requireAuth: false
      },
      component: notAuth
    },
    {
      path: '*',
      meta: {
        requireAuth: false
      },
      component: notFund
    }
  ]
})
router.beforeEach((to, from, next) => {
  store.commit('changeMenu', to.path)
  if (to.meta.requireAuth) {
    if (cookie.token()) {
      store.commit('updateEmpInfo', {
        token: cookie.token(),
        empAccount: cookie.empAccount(),
        empName: cookie.empName()
      })
      // 获取功能权限列表
      if (!store.state.featureList || store.state.featureList.length === 0) {
        api.base.getFeature().then(result => {
          if (result.data.data && result.data.data.length > 0) {
            let featureList = result.data.data
            window.sessionStorage.setItem('featureList', JSON.stringify(featureList))
            store.commit('updateFeatureList', featureList)
          }
          next()
        }).catch(e => {
          next()
        })
      } else {
        next()
      }
    } else {
      window.location.href = profiles.consoleDomain() + '/login?redirecturl=' + encodeURIComponent(window.location.href)
    }
  } else {
    next()
  }
})
export default router
