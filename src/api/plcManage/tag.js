import request from '@/utils/request'

// 查询列表
export function listTag(query) {
  return request({
    url: '/tag/listTag',
    method: 'get',
    params: query
  })
}

// 查询详细
export function getTag(dictId) {
  return request({
    url: '/tag/getTag/' + dictId,
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
export function delTag(dictId) {
  return request({
    url: '/tag/delTag/' + dictId,
    method: 'delete'
  })
}

// 获取选择框列表
export function optionselect() {
  return request({
    url: '/tag/optionselect',
    method: 'get'
  })
}