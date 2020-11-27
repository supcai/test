export default [
  {
    path: '/variable/list',
    name: 'variableList',
    meta: {
      requireAuth: false,
      title: '变量库'
    },
    component: require('@/view/variable/list').default
  }
]
