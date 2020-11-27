import commonAxios from 'axios'
import {profiles, cookie} from './config'
import {Message} from 'element-ui'
// axios 配置
commonAxios.defaults.timeout = 60 * 1000
commonAxios.defaults.baseURL = '/api'
commonAxios.defaults.params = {
  token: cookie.token(),
  appKey: profiles.appKey()
}

// http request 拦截器
commonAxios.interceptors.request.use(function (config) {
  if (!config.params) {
    config.params = {}
    config.params.token = cookie.token()
    config.params.appKey = profiles.appKey()
  } else {
    if (!config.params.token || JSON.stringify(config.params.token) === '{}') {
      config.params.token = cookie.token()
    } else {
      // config.params.token ='';
      config.params.token = cookie.token()
    }
  }
  config.params._t = Date.parse(new Date()) / 1000
  return config
}, function (err) {
  return Promise.reject(err)
})
// http response 拦截器
commonAxios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (error.response) {
    switch (error.response.status) {
      case 401: // 无访问权限
        if (error.config.customErr && error.config.customErr.code === 401) {
          return Promise.reject(error)
        } else {
          window.location.href = '/401'
        }
        break
      case 403: // 未登录
        Message.error(error.response.data.message)
        cookie.removeCookie()
        window.location.href = profiles.consoleDomain() + '/login?redirecturl=' + encodeURIComponent(window.location.href)
        break
      case 409: // 操作冲突
        if (error.config.customErr && error.config.customErr.code === 409) {
          return Promise.reject(error)
        } else {
          Message.error(error.response.data.message)
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
        break
      default:
        if (error.config.customErr && error.config.customErr.code === 'default') {
        } else {
          Message.error(error.response.data.message)
        }
        return Promise.reject(error)
    }
  } else {
    error.response = {}
    if (error.config.customErr && error.config.customErr.code === 'default') {
    } else {
      Message.error('系统异常，请稍后重试')
    }
    return Promise.reject(error.response.data)
  }
  // console.log(JSON.stringify(error));
})
export default commonAxios
