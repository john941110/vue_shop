import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 全局导入ElementUI
// import ElementUI from 'element-ui'
// 全局导入ElementUI的css样式
// 全局导入公共样式
import './assets/css/global.css'
// 全局导入字体图标
import '../public/fonts/iconfont.css'
// 全局导入axios
import axios from 'axios'
// 全局导入vue-table-with-tree-grid第三方插件，重命名为TreeTable。完成树状表格
import TreeTable from 'vue-table-with-tree-grid'
// 全局导入vue-quill-editor 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import NProgress from 'nprogress'

// 用axios的defaults.baseURL属性设置全局的接口头，这样以后写接口地址就只用写端口了
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//请求拦截器，在所有ajax请求发送之前，都回来这个拦截器进行处理,把保存到sessionStorage的token赋值给headers.Authorization，这样才能有权限访问隐私页面。
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 给VUE的原型对象中加一个axios的属性，以后调用ajax的时候可以使用this.axios来调用。
Vue.prototype.axios = axios

// 将重命名为TreeTable的插件，定义为一个新的全局组件，组件名为tree-table。
Vue.component('tree-table', TreeTable)
// 使用富文本编辑器
Vue.use(VueQuillEditor)
// 使用element-ui
// Vue.use(ElementUI)
Vue.config.productionTip = false
// 编辑时间过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
