import Vue from 'vue'
import VueRouter from 'vue-router'
// 从本地路径导入login页面
// import login from '../components/login.vue'
const login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/login.vue')
// import home from '../components/home.vue'
const home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/home.vue')
// import welcome from '../components/welcome.vue'
const welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/welcome.vue')
// import users from '../components/user/users.vue'
const users = () => import(/* webpackChunkName: "users" */ '../components/user/users.vue')
// import rights from '../components/power/rights.vue'
const rights = () => import(/* webpackChunkName: "power" */ '../components/power/rights.vue')
// import roles from '../components/power/roles.vue'
const roles = () => import(/* webpackChunkName: "power" */ '../components/power/roles.vue')
// import goods from '../components/goods/goods.vue'
const goods = () => import(/* webpackChunkName: "goods" */ '../components/goods/goods.vue')
// import params from '../components/goods/params.vue'
const params = () => import(/* webpackChunkName: "goods" */ '../components/goods/params.vue')
// import categories from '../components/goods/categories.vue'
const categories = () => import(/* webpackChunkName: "goods" */ '../components/goods/categories.vue')
// import add from '../components/goods/add.vue'
const add = () => import(/* webpackChunkName: "goods" */ '../components/goods/add.vue')
// import orders from '../components/orders/orders.vue'
const orders = () => import(/* webpackChunkName: "users" */ '../components/orders/orders.vue')
// import reports from '../components/reports/reports.vue'
const reports = () => import(/* webpackChunkName: "users" */ '../components/reports/reports.vue')

Vue.use(VueRouter)

const routes = [
  // 设置默认跳转login页面
  { path: '/', redirect: '/login' },
  // 路由在此处设置
  { path: '/login', component: login },
  // 进去主页后设置默认跳转welcome页面
  {
    path: '/home',
    component: home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: welcome },
      // 主体部分的路由都要在children里面
      { path: '/users', component: users },
      { path: '/rights', component: rights },
      { path: '/roles', component: roles },
      { path: '/params', component: params },
      { path: '/goods', component: goods },
      { path: '/categories', component: categories },
      { path: '/goods/add', component: add },
      { path: '/orders', component: orders },
      { path: '/reports', component: reports }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 全局前置守卫，to是将要访问的路径，from是将要从那个路径跳转来，next是放行，next（）放行，next（'/login'）强制跳转到登录页面
router.beforeEach((to, from, next) => {
  // 如果跳转的路径是'/login'，那么就放行
  if (to.path === '/login') return next()
  // 获取sessionStorage中的token，赋值给tokenstr
  const tokenstr = window.sessionStorage.getItem('token')
  // 如果tokenstr不正确，那么证明用户没有登录，那么强制跳转到登录页面
  if (!tokenstr) return next('/login')
  // 如果tokenstr正确，那么就直接放行
  next()
})

export default router
