import axios from 'axios'
import { useUserStore } from '@/stores/'
import router from '@/router'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

const instance = axios.create({
  // TODO 1. 基础地址，超时时间
  baseURL,
  timeout: 10000
})
// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 如果是请求的txl/app/upload不需要加载动画
    if (
      !config.url.includes('txl/app/upload') &&
      !config.url.includes('txl/appmodify/upload') &&
      !config.url.includes('/txl/mgmt/list') &&
      !config.url.includes('/txl/app/list') &&
      !config.url.includes('/txl/streamer/list')
    ) {
      // 显示loading动画
      config.loadingInstance = ElLoading.service({
        text: '等一哈哈儿...',
        lock: true,
        background: 'rgba(0,0,0,0.6)'
      })
    }

    // TODO 2. 携带token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    // TODO 3. 处理业务失败
    // TODO 4. 摘取核心响应数据
    // 关闭loading动画
    if (res.config.loadingInstance) {
      res.config.loadingInstance.close()
    }

    // 如果ata.status === 200表示处理业务成功
    if (res.data.status === 200) {
      return res
    } else {
      // 处理业务失败, 抛出错误信息, 此时await不会继续执行
      // 给出提示
      ElMessage.error(res.data.message || '服务异常')
      if (res.data.status === 401) {
        router.push('/login')
      }
      return Promise.reject(res.data)
    }
  },
  (err) => {
    // 错误的特殊情况, 处理401错误: 权限不足或token过期 => 拦截到登录
    if (err.response?.status === 401) {
      router.push('/login')
    }
    // 错误的默认情况
    ElMessage.error(err.response?.data.message || '服务异常')
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
