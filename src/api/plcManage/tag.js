import request from '@/utils/request'

// 查询列表
export function listTag(query) {
  return request({
    url: '/tag/listTag',
    method: 'get',
    params: query
  })
}

// 查询列表
export function listTagNoPage(query) {
  return request({
    url: '/tag/listTagNoPage',
    method: 'get',
    params: query
  })
}
// 查询详细
export function getTag(tagId) {
  return request({
    url: '/tag/getTag/' + tagId,
    method: 'get'
  })
}

// 新增
export function addTag(data) {
  return request({
    url: '/tag/addTag',
    method: 'post',
    data: data
  })
}

// 修改
export function updateTag(data) {
  return request({
    url: '/tag/updateTag',
    method: 'put',
    data: data
  })
}

// 删除
export function delTag(tagId) {
  return request({
    url: '/tag/delTag/' + tagId,
    method: 'delete'
  })
} 

// 获取PLC选择框列表
export function optionselectPlc() {
  return request({
    url: '/plc/optionselectPlc',
    method: 'get'
  })
}