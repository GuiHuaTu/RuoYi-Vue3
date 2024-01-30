import request from '@/utils/request'


// 查询列表
export function listTagLast(query) {
    return request({
      url: '/taglast/listTagLast',
      method: 'get',
      params: query
    })
  }
  
  // 查询列表
  export function listTagLastNoPage(query) {
    return request({
      url: '/taglast/listTagLastNoPage',
      method: 'get',
      params: query
    })
  }