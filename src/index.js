import './index.less'
import { $, getIframe, checkAndWarnOpt, isJSONString } from './utils'
// import htmlstr from './template/index.html'
import IMIframe from './component/IMIframe'
import ActivityDialog from './component/ActivityDialog'
import eventBus from './utils/eventBus'
import TIMUTIL from './utils/IMUtil'
// 导入 im 工具类
import {
  HKYIM_IMLOGIN,
  HKYIM_IMREDAY,
  HKYIM_IMERROR,
  HKYIM_IMONMESSAGE,
  HKYIM_IM_INLINE_NUM,
  HKYIM_IM_LIVE_STATUS,
  HKYIM_IM_LIKE_NUM,
  HKYIM_KICKED_OUT,
  HKYIM_PULL_ADDR_CHANGED,
  HKYIM_PUSH_ADDR_CHANGED,
  IM_CALLBACK_MESSAGE,
  IM_CALLBACK_TAB_BEHAVIOR,
  HKYIM_TAB_CHANGE,
  HKYIM_TAB_ACTIVITY,
  HKYIM_TAB_ASK,
  HKYIM_TAB_CLASSES,
  HKYIM_TAB_CHAT,
  HKYIM_TAB_GOODS,
  HKYIM_SWITCH_ONLINENUM,
  HKYIM_GROUP_SHELF_SHOW,
  IM_CHANGE_TABKEY,
  HKYIM_EMOJI_DISPLAY_CHANGE,
  HKYIM_MASK_CLICK,
  SDK_SHELF_CLICK_EVENT,
  HKYIM_IM_INIT_MESSAGE
} from './config/constants'
import IMCommunication from './utils/IMCommunication'
import ShelfDisplay from './component/ShelfDisplay'


const _TIMUTIL = TIMUTIL

const getContainer = (container) => {
  return typeof container === 'string' ? $(container) : container
}

/**
 * @param opt object
 * @param opt.container im容器 type: dom
 * @param opt.dialog 活动弹框 object
 * @param opt.dialog.width 弹框宽度
 * @param opt.dialog.height 弹框高度
 */
let _isInit = false
class SDK {
  READY_TODO = []
  EVENT = {
    error: HKYIM_IMERROR,
    login: HKYIM_IMLOGIN,
    ready: HKYIM_IMREDAY,
    message: HKYIM_IMONMESSAGE,
    onlineNum: HKYIM_IM_INLINE_NUM,
    live: HKYIM_IM_LIVE_STATUS,
    likeNum: HKYIM_IM_LIKE_NUM,
    kickedOut: HKYIM_KICKED_OUT,
    pullAddressChange: HKYIM_PULL_ADDR_CHANGED,
    pushAddressChange: HKYIM_PUSH_ADDR_CHANGED,
    tabChange: HKYIM_TAB_CHANGE,
  }
  TAB_TYPES = {
    chat: HKYIM_TAB_CHAT,
    ask: HKYIM_TAB_ASK,
    classes: HKYIM_TAB_CLASSES,
    activity: HKYIM_TAB_ACTIVITY,
    goods: HKYIM_TAB_GOODS,
  }
  IMCommunicationInstance = IMCommunication

  async init(opt) {
    if (_isInit) {
      console.error('HKYIM 已初始化')
      return
    }
    this.options = opt
    // 检查参数
    checkAndWarnOpt(opt)
    // 初始化tim
    this.tim = _TIMUTIL.init({
      ...opt,
      userID: String(opt.userID)
    })

    this.tabList = opt.tabList || undefined
    const container = getContainer(opt.container)
    this.useUI = opt.useUI
    if(opt.useUI !== false) {
      this.initIframe(opt)
      _TIMUTIL.readyToDo(() => {
        const msg = {
          HKYIM_EVENT_TYPE: IM_CALLBACK_MESSAGE,
          behavior: IM_CALLBACK_TAB_BEHAVIOR,
          tabList: this.tabList,
        }
        this.imPostMessage(msg)

        // setInterval(() => {
        //   this.initMessage({
        //     payload: {
  
        //       text: '这是泽慧的自定义消息体'
  
        //       },
  
        //       uid: '用户ID',
  
        //       nick: '泽慧泽慧'
        //   })
        // },8000)
      })
    }

    this.initDialog(opt)
    this.initShelfDisplay({ ...opt, container })
    this.addEvent()

 

    const styleInfo = window.getComputedStyle
      ? window.getComputedStyle(container, '')
      : container.currentStyle
    this.IMIframeHeight = parseInt(styleInfo.height.replace('px', ''))

    _isInit = true
    // this.addBoxer()
    // this.addComp()
    // this.watch()
  }
  initIframe(opt) {
    IMIframe.init(opt)
  }
  initDialog(opt) {
    ActivityDialog.init(opt)
  }

  initShelfDisplay(opt) {
    ShelfDisplay.init(opt)
    if (opt.showShelf === true) {
      this.on('showShelf', (e) => ShelfDisplay.showShelf(e))
      this.on('hideShelf', (e) => ShelfDisplay.hideShelf(e))
      this.on('emojiDisplayChange', (e) => ShelfDisplay.setShelfVisibility(e))
    }
  }
  addWrapper() {}
  addActivity() {}
  watch() {
    eventBus.addEventListener('changeTitle', (e) => {
      const data = e.target
      this.title.innerText = data.title
    })
  }
  addEvent() {
    window.addEventListener('message', (e) => {
      let data = e.data
      if (isJSONString(data)) {
        data = JSON.parse(data)
      }
      if (data) {
        switch (data.type) {
          case HKYIM_IMREDAY: {
            console.log(e, 'iframe回调消息ready')
            this.IS_READY = true
            eventBus.dispatch('ready', data)
            this.READY_TODO.forEach((item) => {
              item()
            })
            this.READY_TODO = []
            break
          }
          case HKYIM_SWITCH_ONLINENUM:
            console.log(e, '人数开关')
            eventBus.dispatch('switchOnlineNum', data)
            break
          case HKYIM_GROUP_SHELF_SHOW:
            console.log(e, '上架货架')
            eventBus.dispatch('showShelf', data)
            break

          case HKYIM_TAB_CHANGE:
            console.log(e, 'tab切换')
            eventBus.dispatch('tabChange', data)
            break
          case HKYIM_EMOJI_DISPLAY_CHANGE:
            console.log(e, 'emoji展示变化')

            eventBus.dispatch('emojiDisplayChange', data)
            break
          case HKYIM_MASK_CLICK:
            console.log(e, 'mask点击')
            eventBus.dispatch('maskClick', data)
            break
          default:
            break
        }
      }
    })
  }
  on(eventName, callback) {
    callback = callback || function () {}
    if (eventName === SDK_SHELF_CLICK_EVENT) {
      console.log('监听特殊事件触发')
      ShelfDisplay.setListenClick(true)
    }
    eventBus.addEventListener(eventName, callback)
  }
  get(type, params) {
    if (this.IMCommunicationInstance) {
      return this.IMCommunicationInstance.createSession({ type, params })
    } else {
      return new Promise((resolve, reject) => {
        reject(
          new Error('no available IMCommunication Instance, please init first')
        )
      })
    }
  }
  setTabActiveKey(key) {
    // 设置tab 激活
    if (this.tabList.find((item) => item.key === key)) {
      return this.get(IM_CHANGE_TABKEY, {
        key,
      })
    } else {
      alert('初始化参数tabList中不包含：' + key + ' 请检查！！！！！！')
    }
  }
  imPostMessage(data) {
    let imIframe = getIframe()
    imIframe.contentWindow.postMessage(data, '*')
  }
  addScript(scripts) {
    const format = (data) => {
      // todo 添加内容
      return data
    }
    let message = format(scripts)
    this.imPostMessage(message)
  }
  // 接收自定义消息
  initMessage(messages) {
    if(messages && messages.payload) {
      return this.get(HKYIM_IM_INIT_MESSAGE,{
        messages
      })
    }
  }
}

export default new SDK()
