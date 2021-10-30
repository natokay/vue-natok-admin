import request from '@/utils/request'

export function fetchKeys(params) {
  return request({
    url: '/client/keys',
    method: 'get',
    params
  })
}
export function validateClient(params) {
  return request({
    url: '/client/validate',
    method: 'post',
    params
  })
}
export function fetchList(params) {
  return request({
    url: '/client/list',
    method: 'get',
    params
  })
}
export function get(params) {
  return request({
    url: '/client/get',
    method: 'get',
    params
  })
}
export function save(params) {
  return request({
    url: '/client/save',
    method: 'put',
    params
  })
}
export function teleswitch(params) {
  return request({
    url: '/client/switch',
    method: 'post',
    params
  })
}
export function del(params) {
  return request({
    url: '/client/del',
    method: 'delete',
    params
  })
}
