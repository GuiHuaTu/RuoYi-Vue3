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
export function getPlc(dictId) {
  return request({
    url: '/plc/getPlc/' + dictId,
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
export function delPlc(dictId) {
  return request({
    url: '/plc/delPlc/' + dictId,
    method: 'delete'
  })
}


// 获取选择框列表
export function optionselect() {
  return request({
    url: '/plc/optionselect',
    method: 'get'
  })
}