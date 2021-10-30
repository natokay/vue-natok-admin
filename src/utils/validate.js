/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

export function validClient(id, value, type) {
  return validateClient({ clientId: id, value: value, type: type }).then(response => {
    return response.data.state
  }).catch(error => {
    console.log(error)
    return false
  })
}
export function validPort(id, value, type) {
  return validatePort({ portId: id, value: value, type: type }).then(response => {
    return response.data.state
  }).catch(error => {
    console.log(error)
    return false
  })
}

import { validateClient } from '@/api/client'
import { validatePort } from '@/api/port'
