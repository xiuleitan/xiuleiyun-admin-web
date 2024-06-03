import request from '@/utils/request'

// 发送用户id
export const postUserId = (obj) => {
  return request({
    url: '/txl/user/postUserId',
    method: 'POST',
    data: {
      cate_name: obj.cate_name,
      cate_alias: obj.cate_alias
    }
  })
}

// 获取streamerId
export const getStreamerId = () => {
  return request({
    // url: '/txl/user/getStreamerId',
    url: '/app',
    method: 'GET'
  })
}

// 发送用户信息, 让集群服务器启动一个应用
export const postStreamerId = (obj) => {
  return request({
    url: '/txl/app/streamerid',
    method: 'POST',
    data: {
      execType: obj.execType,
      execId: obj.execId
    }
  })
}

// 获取应用列表
export const getAppList = () => {
  return request({
    url: '/txl/app/list',
    method: 'GET'
  })
}

// 获取静态资源-图像
export const getStaticImage = (imgName) => {
  return request({
    url: `api/txl/imgs/${imgName}.jpg`,
    method: 'GET'
  })
}

// 上传分片的应用
export const uploadAppRequest = (formData, i, totalChunks, uploadPercentage) => {
  return request({
    url: `txl/app/upload`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      const temp = Math.round(((i + progress / 100) / totalChunks) * 100)
      uploadPercentage.value = temp === 100 ? 99 : temp // 最后留一个百分点表示服务器正在校验
    }
  })
}

// 上传封面图片
export const uploadCoverRequest = (formData) => {
  return request({
    url: `txl/appcover/upload`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传表单信息
export const uploadFormRequest = (inputData, appID, md5) => {
  return request({
    url: `txl/appform/upload`,
    method: 'POST',
    data: { ...inputData, appID, md5 }
  })
}

// 修改分片的应用
export const uploadAppModifyRequest = (formData, i, totalChunks, uploadPercentage) => {
  return request({
    url: `txl/appmodify/upload`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      const temp = Math.round(((i + progress / 100) / totalChunks) * 100)
      uploadPercentage.value = temp === 100 ? 99 : temp // 最后留一个百分点表示服务器正在校验
    }
  })
}
// 上传修改封面图片
export const uploadCoverModifyRequest = (formData) => {
  return request({
    url: `txl/appcovermodify/upload`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传修改表单信息
export const uploadFormModifyRequest = (inputData, appID, md5) => {
  return request({
    url: `txl/appformmodify/upload`,
    method: 'POST',
    data: { ...inputData, appID, md5 }
  })
}
// 请求删除应用
export const deleteAppRequest = (appID) => {
  return request({
    url: `txl/app/delete`,
    method: 'POST',
    data: { appID }
  })
}

// 请求手动同步应用一次
export const syncAppRequest = (appID) => {
  return request({
    url: `txl/app/sync`,
    method: 'POST',
    data: { appID }
  })
}

//获取streamer列表
export const getStreamerList = () => {
  return request({
    url: '/txl/streamer/list',
    method: 'GET'
  })
}

// 请求断开streamer (删除streamer)
export const disconnectStreamerRequest = (streamerID) => {
  return request({
    url: `/txl/streamer/disconnect`,
    method: 'POST',
    data: { streamerID }
  })
}
