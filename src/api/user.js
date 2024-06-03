import request from '@/utils/request.js'

// 点击注册post请求
export const userRegisterRequest = (obj) => {
  return request({
    url: '/api/reg',
    method: 'post',
    data: {
      username: obj.username,
      password: obj.password,
      repassword: obj.repassword
    }
  })
}

// 点击登录post请求
export const userLoginRequest = (obj) => {
  return request({
    url: '/api/admin/login',
    method: 'post',
    data: {
      username: obj.username,
      password: obj.password
    }
  })
}

// 获取用户信息get请求
export const userInfoRequest = () => {
  return request({
    url: '/my/userinfo',
    method: 'get'
  })
}
