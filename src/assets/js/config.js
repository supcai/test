/**
 *  配置信息
 */
import Cookies from 'js-cookie'
import tld from 'tldjs'
// 将 localhost 设置为合法的域名
const tldjs = tld.fromUserSettings({
  validHosts: ['localhost']
})
const profiles = {
  // 环境变量
  env: () => process.env.NODE_ENV,
  /**
   * cookie储存域判断
   * ip地址返回ip
   * 域名返回主域名
   * localhost 返回 localhost
   * @returns {*|string} cookie储存域
   */
  cookieDomain: () => {
    let domain = ''
    const r = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/ // 判断是否为IP地址
    // 首先确定是否为ip
    if (r.test(document.domain)) {
      domain = document.domain
    } else {
      domain = tldjs.getDomain(document.domain)
    }
    return domain
  },
  consoleDomain: () => {
    return process.env.CONSOLE_DOMAIN
  },
  appKey: () => {
    return process.env.APP_KEY
  }
}
let cookie = {
  token: () => {
    return Cookies.get('btoken')
  },
  empAccount: () => {
    return Cookies.get('empAccount')
  },
  empName: () => {
    return Cookies.get('empName')
  },
  removeCookie: (cookieName) => {
    if (cookieName) {
      Cookies.remove(cookieName)
    } else {
      Cookies.remove('btoken')
      Cookies.remove('empAccount')
      Cookies.remove('empName')
    }
  },
  set: (cookieName, value, { domain = this.cookieDomain(), path = '/', ...rest }) => {
    Cookies.set(cookieName, value, {domain, path, ...rest})
  }
}
export {profiles, cookie}
