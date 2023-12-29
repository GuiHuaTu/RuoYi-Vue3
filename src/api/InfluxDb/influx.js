import request from '@/utils/request'

// 获取 
export function queryPlcLog(query) {
    return request({
      url: '/influxDb/queryPlcLog',
      method: 'get',
      params: query
    })
  }


// 获取
export function queryByFluxQuery(query) {
  return request({
    url: '/influxDb/queryByFluxQuery',
    method: 'get',
    params: query
  })
}
  