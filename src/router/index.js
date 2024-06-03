import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/index.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // history 模式
  routes: [
    // 当匹配到根路径/时, 强制跳转到/search路径
    { path: '/', redirect: '/login' },
    // 匹配路径为 /login 的路由, 加载 Login 组件
    { path: '/login', component: () => import('@/views/login/LoginPage.vue') },
    // 匹配路径为 /appshow 的路由, 加载 AppShowPage 组件
    { path: '/mgmt', component: () => import('@/views/mgmt/MgMt.vue') },
    // 所有路径都匹配不到时, 加载 NotFound 组件
    { path: '/:pathMatch(.*)*', component: () => import('@/views/others/NotFoundPage.vue') }
  ]
})

//路由前置守卫: 登录访问拦截
router.beforeEach(async (to) => {
  // 从仓库获取token
  const userStore = useUserStore() // 这行代码必须写在函数内部，否则会报错
  const token = userStore.token

  if (to.path !== '/login' && !token) {
    // 消息提示框
    ElMessageBox.alert('请先登录', '消息提示', {
      confirmButtonText: '好的',
      showClose: false,
      type: 'warning'
    })
    return '/login'
  }
  // 默认放行
})

export default router
