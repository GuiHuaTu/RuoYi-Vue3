import request from '@/utils/request'

// 获取路由
export const getRouters = (menuId) => {
  return request({
    url: '/Login/getRouters' + (menuId === undefined ? '' : '/' + menuId),
    method: 'get'
  })
}