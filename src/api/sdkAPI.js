import { get, post } from '../utils/request'
import { LEARN_API } from '../config/constants'

// 这里要给页面输出已经处理过的、确实可用的数据

const urlGetMe = (params) => {
  return new Promise((resolve, reject) => {
    let data = {
      url: `${LEARN_API}/me`,
      data: params,
    }
    get(data)
      .then((res) => {
        res = res || {}
        resolve(res)
      })
      .catch((err) => reject(err))
  })
}

// 上报领取红包
const postRedPackage = (params) => {
  return new Promise((resolve, reject) => {
    let data = {
      url: `${LEARN_API}/student/content/red_package/receive`,
      data: params,
    }
    post(data)
      .then((res) => {
        res = res || {}
        resolve(res)
      })
      .catch((err) => reject(err))
  })
}

export { urlGetMe, postRedPackage }
