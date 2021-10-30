import request from '@/utils/request'

export function state(data) {
  return request({
    url: '/dashboard/state',
    method: 'get',
    data
  })
}
