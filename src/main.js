import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 全局导入ElementUI
import ElementUI from 'element-ui'
// 全局导入ElementUI的css样式
import 'element-ui/lib/theme-chalk/index.css'
// 全局导入公共样式
import './assets/css/global.css'
// 全局导入字体图标
import '../public/fonts/iconfont.css'
// 全局导入axios
import axios from 'axios'

// 用axios的defaults.baseURL属性设置全局的接口头，这样以后写接口地址就只用写端口了
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//请求拦截器，在所有ajax请求发送之前，都回来这个拦截器进行处理,把保存到sessionStorage的token赋值给headers.Authorization，这样才能有权限访问隐私页面。
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 给VUE的原型对象中加一个axios的属性，以后调用ajax的时候可以使用this.axios来调用。
Vue.prototype.axios = axios

Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
