import request from '@/utils/request'

// 获取节点状态的get请求
export const getNodesRequest = () => {
  return request({
    url: '/txl/mgmt/list',
    method: 'get'
  })
}
