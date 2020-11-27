// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import layouts from './layouts'
import router from './router'
import Vuex from 'vuex'
import store from './store/index'
import Element from 'element-ui'
import feroToolkit from 'fero-toolkit-vue'
import 'element-ui/lib/theme-chalk/index.css'
import Meta from 'vue-meta'
import _ from 'lodash'
import './assets/css/global.less'
import utils from '@/assets/js/utils'
import projectUtils from '@/assets/js/project-utils'
import constants from '@/assets/js/constants'
import api from './assets/js/api'
import './assets/css/iconfont.css'

Vue.use(Vuex)
Vue.use(Element)
Vue.use(feroToolkit)
Vue.directive('dialogDrag', feroToolkit.dialogDrag)
Vue.use(Meta)
Vue.use(layouts)
Vue.config.productionTip = false

Vue.prototype._ = _
Vue.prototype.utils = utils
Vue.prototype.projectUtils = projectUtils
Vue.prototype.rulesToolkit = feroToolkit.rulesToolkit
Vue.prototype.constants = constants
Vue.prototype.api = api
const errorHandler = (err, vm, info) => {
  console.error('全局异常捕获')
  console.error(err)
  console.error(vm)
  console.error(info)
  function report (err, vm, info) {
    let reportUrl = '/api/report'
    new Image().src = reportUrl + '/error?err=' + err + '&info=' + info
  }
  report(err, vm, info)
}
Vue.prototype.errorHandler = errorHandler
Vue.config.errorHandler = errorHandler

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
