import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: '/role/listRole',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: '/role/getRole/' + roleId,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: '/role/addRole',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/role/updateRole',
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(roleId) {
  return request({
    url: '/role/delRole/' + roleId,
    method: 'delete'
  })
}


// 角色数据权限
export function dataScope(data) {
  return request({
    url: '/role/dataScope',
    method: 'put',
    data: data
  })
}

// 角色状态修改
export function changeRoleStatus(roleId, status) {
  const data = {
    roleId,
    status
  }
  return request({
    url: '/role/changeStatus',
    method: 'put',
    data: data
  })
}

// 查询角色已授权用户列表
export function allocatedUserList(query) {
  return request({
    url: '/role/allocatedUserList',
    method: 'get',
    params: query
  })
}

// 查询角色未授权用户列表
export function unallocatedUserList(query) {
  return request({
    url: '/role/unallocatedUserList',
    method: 'get',
    params: query
  })
}

// 取消用户授权角色
export function authUserCancel(data) {
  return request({
    url: '/role/authUserCancel',
    method: 'put',
    data: data
  })
}

// 批量取消用户授权角色
export function authUserCancelAll(data) {
  return request({
    url: '/role/authUserCancelAll',
    method: 'put',
    params: data
  })
}

// 授权用户选择
export function authUserSelectAll(data) {
  return request({
    url: '/role/authUserSelectAll',
    method: 'put',
    params: data
  })
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId) {
  return request({
    url: '/role/deptTreeSelect/' + roleId,
    method: 'get'
  })
}
