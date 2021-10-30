import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/port/list',
    method: 'get',
    params
  })
}
export function validatePort(params) {
  return request({
    url: '/port/validate',
    method: 'post',
    params
  })
}
export function get(params) {
  return request({
    url: '/port/get',
    method: 'get',
    params
  })
}
export function save(params) {
  return request({
    url: '/port/save',
    method: 'put',
    params
  })
}

export function teleswitch(params) {
  return request({
    url: '/port/switch',
    method: 'post',
    params
  })
}
export function del(params) {
  return request({
    url: '/port/del',
    method: 'delete',
    params
  })
}
