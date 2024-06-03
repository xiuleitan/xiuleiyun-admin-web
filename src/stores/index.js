import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia().use(piniaPluginPersistedstate)

export default pinia

// export * from './modules/user'

// ------------------------------ 用户信息仓库 --------------------------
import { defineStore } from 'pinia'
import { ref } from 'vue'
// import { userInfoRequest } from '@/api/user.js'
export const useUserStore = defineStore(
  'could-render',
  () => {
    // token
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    }

    // 用户信息
    const userInfo = ref({})
    // const getUserInfo = () => {
    //   userInfo.value = {
    //     username: 'admin',
    //     password: 'admin111'
    //   }
    // }
    // const getUserInfo = async () => {
    //   const res = await userInfoRequest()
    //   userInfo.value = {
    //     email: res.data.data.email,
    //     id: res.data.data.id,
    //     nickname: res.data.data.nickname,
    //     user_pic: res.data.data.user_pic,
    //     username: res.data.data.username
    //   }
    // }
    // 退出登录
    const logout = () => {
      removeToken()
      userInfo.value = {}
    }

    return {
      token,
      setToken,
      removeToken,
      userInfo,
      // getUserInfo,
      logout
    }
  },
  {
    persist: {
      key: 'uefonted'
    }
  }
)
