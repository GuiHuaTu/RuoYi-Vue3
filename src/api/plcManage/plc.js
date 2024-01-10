import request from '@/utils/request'

// 查询列表
export function listPlc(query) {
  return request({
    url: '/plc/listPlc',
    method: 'get',
    params: query
  })
}

// 查询详细
export function getPlc(plcId) {
  return request({
    url: '/plc/getPlc/' + plcId,
    method: 'get'
  })
}

// 新增
export function addPlc(data) {
  return request({
    url: '/plc/addPlc',
    method: 'post',
    data: data
  })
}

// 修改
export function updatePlc(data) {
  return request({
    url: '/plc/updatePlc',
    method: 'put',
    data: data
  })
}

// 删除
export function delPlc(plcId) {
  return request({
    url: '/plc/delPlc/' + plcId,
    method: 'delete'
  })
}


// 获取串口列表
export function getPortNames() {
  return request({
    url: '/plc/getPortNames',
    method: 'get'
  })
} 
// 获取系统配置列表
export function getConfig(key) {
  return request({
    url: '/plc/getConfig/'+key,
    method: 'get'
  })
}