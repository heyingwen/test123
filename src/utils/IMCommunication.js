// import EventBus from './eventBus'
import { getIframe, isJSONString } from './index'

const EVENT_TYPE = 'HKYIM_EVENT_TYPE'
class IMCommunication {
  constructor() {
    this._sessions = {}
    this._eventCallback = []
    this.startEventListener()
  }

  // 开启事件监听器
  startEventListener() {
    const callback = (e) => {
      let data = e.data
      if (isJSONString(data)) {
        data = JSON.parse(data)
      }
      if (data) {
        const eventType = data[EVENT_TYPE]
        console.log('--------------', data, eventType)
        if (data && eventType) {
          this.dispatch(eventType, data)
          this._sessions[data.session] &&
            this._sessions[data.session](data.data)
        }
      }
    }

    window.addEventListener('message', callback)
  }

  imPostMessage(data) {
    let imIframe = getIframe()
    imIframe.contentWindow.postMessage(data, '*')
  }

  use(eventName, callback) {
    // 事件注册中心命中触发
    this._eventCallback[eventName] = (data) => {
      const resolve = (result) => {
        this.imPostMessage({
          HKYIM_EVENT_TYPE: eventName,
          session: data.session,
          data: result,
        })
      }
      callback(data.params, resolve)
    }
  }
  // 注册事件

  commit(eventName, data) {
    if (this._eventCallback[eventName]) {
      this._eventCallback[eventName](data)
    }
  }

  dispatch(eventName, data) {
    this.commit(eventName, data)
  }

  createSessionName(type) {
    return `${type}_${Date.now()}_${Math.random()}`
  }

  createSession(options) {
    const { type, params } = options

    const newSessionName = this.createSessionName(type)

    const newSession = new Promise((resolve, reject) => {
      // debugger

      try {
        // console.log(getIframe)
        if (window.HKYIM.useUI === false) {
          console.warn('无UI取消发送')
          return
        } 
        let IMIframe = getIframe()
        console.log({ IMIframe })
        
        if (!IMIframe) {
          reject(new Error('找不到IM窗口'))
        } else {
          IMIframe = IMIframe.contentWindow
        }

        const message = {
          HKYIM_EVENT_TYPE: type,
          session: newSessionName,
          params,
          messageType: 'session',
        }

        const callback = (data) => {
          resolve(data)
        }
        this._sessions[newSessionName] = callback
        // alert(window.HKYIM.useUI)
        
        IMIframe.postMessage(message, '*')

        console.log('sdkmessage', message)
      } catch (error) {
        reject(error)
      }
    })

    // this.sessions[newSessionName] = newSession

    return newSession
  }
}

export default new IMCommunication()
