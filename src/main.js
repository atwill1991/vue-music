import 'babel-polyfill' // es6 语法补丁
import Vue from 'vue'
import App from './App'
import router from './router'

import fastclick from 'fastclick' // 解决移动端click事件300ms延时

import 'common/stylus/index.styl'
import VueLazyload from 'vue-lazyload' // 用于图片懒加载

Vue.config.productionTip = false

fastclick.attach(document.body)

Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
