import simpleLayout from './simple'
import defaultLayout from './default'
const components = [
  simpleLayout,
  defaultLayout
]
const install = function (Vue, opts = {}) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default {
  install,
  simpleLayout,
  defaultLayout
}
