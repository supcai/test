import axios from './http'

const api = {
  base: {
    // 登录
    goLogin: data => axios.put('/app/b/v1/user/login/menu/feature', data),
    // 退出登录
    logOut: () => axios.put('/app/b/v1/user/logout'),
    // 获取菜单
    // getMenu: () => axios.get('/app/b/v1/user/menu/feature/list'),
    getMenu: () => axios.get('/static/demo/menu.json', {baseURL: ''}),
    // 获取全部功能
    getFeature: () => axios.get('/app/b/v1/user/feature/alllist')
  }
}
export default api
