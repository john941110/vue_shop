import Vue from 'vue'
import VueRouter from 'vue-router'
// 从本地路径导入login页面
import login from '../components/login.vue'
// 从本地路径导入home页面
import home from '../components/home.vue'
import welcome from '../components/welcome.vue'
import users from '../components/user/users.vue'

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
      { path: '/users', component: users }
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
