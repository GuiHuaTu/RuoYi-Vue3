import request from '@/utils/request'

// 获取用户详细信息
export function queryPlcLog(query) {
    return request({
      url: '/InfluxDb/QueryPlcLog',
      method: 'get',
      params: query
    })
  }