export default [
  {
    path: '/model/list',
    name: 'modelList',
    meta: {
      requireAuth: false,
      title: '风控模型'
    },
    component: require('@/view/model/list').default
  },
  {
    path: '/model/detail',
    name: 'modelDetail',
    meta: {
      requireAuth: false,
      parentName: 'modelList',
      title: '模型详情'
    },
    component: require('@/view/model/detail').default
  }
]
