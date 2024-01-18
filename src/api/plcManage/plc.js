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

// // 
// export function acquisitionStart(data) {
//   return request({
//     url: '/plc/acquisitionStart',
//     method: 'post',
//     data: data
//   })
// }

// 添加采集任务
export function acquisitionJobAdd(data) {
  return request({
    url: '/plc/acquisitionJobAdd',
    method: 'post',
    data: data
  })
}


// 开启采集任务
export function acquisitionJobStart(data) {
  return request({
    url: '/plc/acquisitionJobStart',
    method: 'post',
    data: data
  })
}
// 暂停采集任务
export function acquisitionJobStop(data) {
  return request({
    url: '/plc/acquisitionJobStop',
    method: 'post',
    data: data
  })
}

// 创建或更新并启动定时清理历史数据任务
export function deleteDataJobAdd(plcId,beforeDays,periodDays) {
  return request({
    url: '/plc/deleteDataJobAdd/'+plcId+'/'+beforeDays+'/'+periodDays,
    method: 'get'
  })
}

// 暂停定时清理历史数据任务
export function deleteDataJobStop(plcId) {
  return request({
    url: '/plc/deleteDataJobStop/'+plcId,
    method: 'get'
  })
}

