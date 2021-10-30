import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import '@/styles/index.scss' // global css
import '@/styles/nat-basic.css' // custom css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control
import md5 from 'js-md5'

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// 中文版 element-ui
Vue.use(ElementUI, { zhLocale, enLocale })

Vue.config.productionTip = false
Vue.prototype.$md5 = md5

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
