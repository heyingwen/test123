const isMobile = /(iphone|android)/.test(navigator.userAgent.toLowerCase())
const $ = (selector, node) => {
  let n = node ? node : document
  return typeof selector === 'string' ? n.querySelector(selector) : selector
}
const create = (type, className, innerHTML) => {
  const ele = document.createElement(type)
  if (className) {
    ele.className = className
  }
  if (innerHTML) {
    ele.innerHTML = innerHTML
  }
  return ele
}
const createFrag = (type) => {
  return document.createDocumentFragment(type)
}
// 动态加载js并支持回调-
function loadJs(src, callback) {
  let sc = document.createElement('script')
  sc.type = 'text/javascript'
  sc.src = src
  if (callback) {
    if (document.addEventListener) {
      sc.addEventListener('load', callback, false)
    } else {
      sc.onreadystatechange = function () {
        if (/loaded|complete/.test(sc.readyState)) {
          sc.onreadystatechange = null
          callback()
        }
      }
    }
  }
  document.body.appendChild(sc)
}

/**
 * 可以把容器里的dom节点映射到对象中，便于后面使用
 * @param {*} boxer 容器节点
 * @param {*} maps dom节点和所映射的属性
 * @param {*} ctx 所要映射的对象
 */
const mapElements = (boxer, maps, ctx) => {
  for (let key in maps) {
    if (Object.prototype.hasOwnProperty.call(maps, key)) {
      ctx[key] = boxer.querySelector(maps[key])
    }
  }
}

const cookie = {
  get(keys) {
    const mat = new RegExp('(^|[^a-z])' + keys + '=(.*?)(;|$)', 'i').exec(
      document.cookie
    )
    return mat ? decodeURIComponent(mat[2]) : ''
  },
  set(name, value, expires, path, domain, secure) {
    let cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value)
    if (expires instanceof Date) {
      cookieText += '; expires=' + expires.toGMTString()
    }
    if (path) {
      cookieText += '; path=' + path
    }
    if (domain) {
      cookieText += '; domain=' + domain
    }
    if (secure) {
      cookieText += '; secure'
    }
    document.cookie = cookieText
  },
  remove(name, path, domain, secure) {
    this.set(name, '', new Date(0), path, domain, secure)
  },
}
function isUrl(url) {
  let result = /(http|https):\/\/([\w.]+\/?)\S*/.test(url)
  return result
}

const getIframe = () => {
  // debugger
  // console.warn('getIframe')
  // console.warn($, $('#__hkyim-iframe__'))
  let imIframe = $('#__hkyim-iframe__')
  imIframe[0] ? (imIframe = imIframe[0]) : null
  return imIframe
}
export const imPostMessage = (data) => {
  // debugger
  // console.warn('getIframe')
  // console.warn($, $('#__hkyim-iframe__'))
  let imIframe = $('#__hkyim-iframe__')
  imIframe[0] ? (imIframe = imIframe[0]) : null
  imIframe.contentWindow.postMessage(data, '*')
}

const isHKYClient = () => {
  let ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('hky-live') !== -1
}
// 用于iframe的序列化参数
const serialParams = (data, isPrefix = false, blackList = []) => {
  let prefix = isPrefix ? '?' : ''
  let result = []
  // console.log(Object.keys(data), blackList)
  Object.keys(data).forEach((i) => {
    let value = data[i]
    if (!blackList.includes(i)) {
      if (Object.prototype.toString.call(value) === '[object Array]') {
        value.forEach((_value) => {
          result.push(
            `${encodeURIComponent(i)}[]=${encodeURIComponent(_value)}`
          )
        })
      } else {
        result.push(`${encodeURIComponent(i)}=${encodeURIComponent(value)}`)
      }
    }
  })
  return result.length ? prefix + result.join('&') : ''
}

const checkAndWarnOpt = (opt) => {

  console.log(`
                /////////////////////////
                ///// 欢迎使用HKYIM //////
                /////////////////////////
                `)
  console.log(`
                ///// 开始参数检查 /////
                `)

  console.log('传入参数：', opt)

  if (!opt) {
    HKYWarn('opt未定义，请检查init函数传入参数')
  } else {
    const {
      container,
      userID,
      userSig,
      roomID,
      role,
      contentId,
      nickName,
      avatar,
      kkbLiveId,
      isLesson,
      liveId,
      liveToken,
      auth,
      dialog,
      isGuest,
      tabList,
      tabActiveKey,
      showShelf,
      tesToken,
    } = opt

    if(!container) {
      HKYWarn('未传入容器元素，无法初始化')
    } else if(!container.tagName) {
      HKYWarn('传入的不是Document Element元素，可能无法正常初始化')
    }
    if(!userID) {
      HKYWarn(`在${isGuest ? '' : '非'}游客模式下未传入userID，将无法正常登录IM系统`)
    }
    if (!userSig) {
      HKYWarn('未传入userSig，无法正常登录IM聊天室')
    }
    if(!roomID) {
      HKYWarn('未传入roomID, 无法正常登录IM聊天室')
    }
    if(!role) {
      HKYWarn('未传入角色，无法确认用户是什么身份')
    }
    if(!contentId) {
      HKYWarn('未传入contentId，营销直播（多机位直播）可无视该警告，课程直播、公开课直播可能会导致无法正常进入直播间')
    }
    if(!nickName && !isGuest) {
      HKYWarn('在非游客模式下未传入昵称，将向LPS系统请求用户昵称')
    }
    if(!avatar && !isGuest) {
      HKYWarn('在非游客模式下未传入头像，将向LPS系统请求用户头像')
    }
    if(kkbLiveId) {
      HKYWarn('kkbLiveId是1.x版本的参数，已经被废弃，请更新为liveId')
    }
    if(isLesson) {
      HKYWarn('传入备课参数，IM将作为备课端启动')
    }
    if(!liveId) {
      HKYWarn('未传入liveId，可能会影响课程和公开课直播中需要授权的功能')
    }
    if(!liveToken) {
      HKYWarn('未传入liveToken，可能会影响课程和公开课直播中需要授权的功能')
    }
    if(!auth && !tesToken) {
      console.warn('%cHKYIM警告：未传入auth或tesToken参数，将无法使用需要用户权限才能使用的功能（如答题）', 'color: red; font-weight: 600;')
    }
    if(!dialog || !(dialog.width|| dialog.height)) {
      HKYWarn('未指定弹窗活动区宽高，将使用默认宽高')
    }
    HKYWarn(`将以${isGuest ? '' : '非'}游客模式进入IM直播间`)
    if(!tabList) {
      HKYWarn('未传入tabList，将使用默认的tab列表')
    } else if(!tabList.length) {
      HKYWarn('tabList为空数组，可能无法使用某些功能')
    }
    if (!tabActiveKey) {
      HKYWarn('未传入激活的tab，将使用默认Tab')
    }
    if(typeof showShelf !== 'boolean') {
      HKYWarn('未传入IM展示货架广告参数，默认不展示货架广告')
    }
  }

  console.warn('如果对以上检查结果有疑惑，或您无法正常初始化HKYIM聊天室，请访问 http://wiki.kaikeba.com/pages/viewpage.action?pageId=41081169 查看文档')

}

const HKYWarn = (...values) => console.warn('HKYIM警告:', ...values)

const isJSONString = (str) => {

  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str)
      return !!(typeof obj === 'object' && obj)
    } catch(e) {
      console.log(`error：${str}!!!`, e)
      return false
    }
  } else {
    console.log('It is not a string!')
    return false
  }
} 
export function createArray(data) {
  const isArray = Object.prototype.toString.call(data) === '[object Array]'
  return isArray ? data : [data]
}


export {
  $,
  create,
  cookie,
  createFrag,
  loadJs,
  isMobile,
  mapElements,
  isUrl,
  getIframe,
  isHKYClient,
  serialParams,
  checkAndWarnOpt,
  isJSONString,
}
