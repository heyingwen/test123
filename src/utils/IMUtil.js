import TIM from 'tim-js-sdk'
import { createArray, imPostMessage } from '@/utils'
import eventBus from './eventBus'
import IMCommunication from './IMCommunication'
import { useDefaultEvent, userDefinedEvent, groupInfoEvent } from './IMEvent'
import {
  MULTI_PUSH_ADDR_CHANGED,
  HKYIM_IMERROR,
  HKYIM_IMLOGIN,
  HKYIM_IMONMESSAGE,
  HKYIM_GROUP_SHELF_SHOW,
  HKYIM_SWITCH_ONLINENUM,
  HKYIM_IMREDAY,
  HKYIM_KICKED_OUT,
  CUSTOM_MSG,
  HKYIM_MULTI_PUSH_ADDR_CHANGED,
  SDKAPPID,
  HKYIM_IFRAME_LOAD,
} from '../config/constants'

const isProdEnv = process.env.NODE_ENV === 'production'
class IMUtilsClass {
  init = (opt) => {
    let options = {
      SDKAppID: Number(SDKAPPID),
      // unlimitedAVChatRoom: true
    }
    console.log('TIM options::', options, process.env.NODE_ENV)
    const tim = TIM.create(options)
    tim.setLogLevel(isProdEnv ? 1 : 0)
    this.tim = tim
    window.tim = tim

    this.chatRoomID = opt.roomID
    this.IMOptions = opt
    this.addSDKEvents()
    this.isLogin = false
    this.isSDKReady = false

    this.unReadyList = [
      // () => {
      //   this.startHeartBeat()
      // }
    ]
    this.callbackList = []
    // load iframe 加载完成

    return tim
  }

  logout = () => {
    this.destory()
    return tim.logout()
  }

  destory = () => {
    this.chatRoomID = ''
    tim.off(TIM.EVENT.SDK_READY, this.onSDKReady)
    tim.off(TIM.EVENT.ERROR, this.onSDKError)
    tim.off(TIM.EVENT.MESSAGE_RECEIVED, this.onMessageReceived)
    tim.off(TIM.EVENT.KICKED_OUT, this.onKickedOut)

    this.isLogin = false
    this.isSDKReady = false
    this.unReadyList = []
    this.callbackList = []
    this.endHeartBeat()
  }

  addSDKEvents = () => {
    tim.on(TIM.EVENT.SDK_READY, this.onSDKReady)
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, this.onMessageReceived)
    tim.on(TIM.EVENT.ERROR, this.onSDKError)
    // todo 添加监听kicked_out事件
    tim.on(TIM.EVENT.KICKED_OUT, this.onKickedOut)
    // 新增 useUI 字段
    if (this.IMOptions.useUI === false) {
      // alert(false)
      this.login(this.IMOptions.userID, this.IMOptions.userSig)
    } else {
      IMCommunication.use(HKYIM_IFRAME_LOAD, (data, resolve) => {
        this.login(this.IMOptions.userID, this.IMOptions.userSig)
        resolve({
          msg: '接收onload 成功',
        })
      })
    }
    useDefaultEvent(this)

    //
  }

  onSDKReady = (event) => {
    const execute = (e) => {
      console.log('sdk 准备好了', e, this)
      this.isSDKReady = true
      eventBus.dispatch('ready', e)
      console.log(this.unReadyList, 'unReadyList 成功')
      
      console.log('HKYIM_IMREDAY')
      this.readyToDo()
      this.updateUserInfo({
        nick: this.IMOptions.nickName || '游客',
        avatar: this.IMOptions.avatar,
      })
      this.joinGroup(this.chatRoomID).then((resgroup) => {
        console.log(resgroup, 'joinfroup')
        this
        this.getGroupProfile({
          groupID: this.chatRoomID,
        }).then((res) => {
          groupInfoEvent(res)
        })
      })
      this.startHeartBeat()
      IMCommunication.createSession({
        type: HKYIM_IMREDAY,
        params: event,
      })
    }

    execute(event)
  }

  onMessageReceived = (event) => {
    console.log('来消息了：：：IMSDK', event)
    try {
      if (this.IMOptions.useUI !== false) {
        IMCommunication.createSession({
          type: HKYIM_IMONMESSAGE,
          params: event,
        })
      }

      const userID = this.IMOptions.userID
      event.data.forEach((msg) => {
        const { groupProfile, userDefinedField } = msg.payload

        const userDefinedFieldObj =
          userDefinedField && userDefinedField !== ''
            ? JSON.parse(userDefinedField)
            : {}
        // 普通文字消息
        // if (msg.to === this.chatRoomID && msg.payload.text) {

        //   postMessage.send({
        //     type: HKYIM_IMONMESSAGE,
        //     data: myMSG,
        //   })
        //   chatMessageBuffer.addMessage(msg)
        // }

        // 自定义消息图片消息
        if (
          msg.payload.data &&
          msg.payload.data.includes(CUSTOM_MSG) &&
          msg.to === this.chatRoomID
        ) {
          console.log('图片消息::', userDefinedFieldObj)
          // chatMessageBuffer.addMessage(msg, 2)
        }
        // 消息是否是发给自己或者当前房间
        console.log(
          userDefinedFieldObj,
          msg,
          'proto_name.msg.to',
          msg.to === userID || msg.to === this.chatRoomID
        )

        if (msg.to === userID || msg.to === this.chatRoomID) {
          // 区分是否是自定义消息
          // alert(userDefinedFieldObj.proto_name)

          if (userDefinedFieldObj.proto_name) {
            // const userDefinedFieldObjContent = userDefinedFieldObj.content
            userDefinedEvent(userDefinedFieldObj, this.chatRoomID, msg)
          }
        }
        if (msg.payload.data) {
          console.log(msg, '消息')
          this.handlerSpecialMessage(msg, 'im')
        }
      })
    } catch (error) {
      console.error(error)
    }

    // event.data.forEach(item => {
    //   if (item.payload.text) {
    //     this.updateConversationList('add', item)
    //   } else if (item.payload.data) {
    //     // alert('收到特殊消息')
    //     specialMSGHanlder.messageHandler(item)
    //   }
    // })heartBeatInterval
  }

  onSDKError = (event) => {
    eventBus.dispatch('error', {
      type: HKYIM_IMERROR,
      data: event,
    })
    IMCommunication.createSession({
      type: HKYIM_IMERROR,
      params: event,
    })
    console.log('SDK错误', event, this)
    if (event.data.code === 2999) {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  onKickedOut = (event) => {
    console.log('被踢出直播间::', event, this)
    eventBus.dispatch('kickedOut', {
      type: HKYIM_KICKED_OUT,
      data: event,
    })
    IMCommunication.createSession({
      type: HKYIM_KICKED_OUT,
      params: event,
    })

    this.destory()
  }

  checkSDKready = (callback) => {
    this.callbackList.push(callback)
    if (this.isSDKReady) {
      callback()
    } else {
      tim.on(TIM.EVENT.SDK_READY, () => {
        callback()
      })
    }
  }

  handlerSpecialMessage = (msg) => {
    let msgData = JSON.parse(msg.payload.data)
    console.log(msgData, 'SpecialMessage')
    if (this.role === 4) {
      console.log(this.role)
    } else {
      switch (msgData.proto_name) {
        case MULTI_PUSH_ADDR_CHANGED:
          console.log('多机位推流地址已变化::', msgData)
          eventBus.dispatch('multiPushAddressChange', {
            type: HKYIM_MULTI_PUSH_ADDR_CHANGED,
            data: msgData.content,
          })
          break
        default:
          break
      }
    }
  }

  login = (userID, userSig) =>
    new Promise((resolve, reject) => {
      console.log(tim)
      if (this.isLogin) {
        resolve()
        return
      }
      tim
        .login({
          userID,
          userSig,
        })
        .then((res) => {
          console.log('登录成功', res)
          this.isLogin = true

          // this.readyToDo(() => this.startHeartBeat())
          eventBus.dispatch('login', {
            type: HKYIM_IMLOGIN,
            data: event,
          })
          IMCommunication.createSession({
            type: HKYIM_IMLOGIN,
            params: res,
          })
          this.readyToDo()

          resolve(res)
        })
        .catch((err) => {
          console.log('登录失败', err)
          reject(err)
        })
    })

  updateUserInfo = (info) => tim.updateMyProfile(info)

  joinGroup = (groupID, type = TIM.TYPES.GRP_AVCHATROOM) => {
    return tim.joinGroup({
      groupID,
      type,
    })
  }

  sendMessage = (chatRoomID, msg, retry = false) => {
    console.log('user send 行为', chatRoomID, msg)
    return new Promise((resolve, reject) => {
      const message = tim.createTextMessage({
        to: chatRoomID,
        conversationType: TIM.TYPES.CONV_GROUP,
        payload: {
          text: msg,
        },
      })
      // console.log(message,'mmmmm??//')
      tim
        .sendMessage(message)
        .then(
          (res) => {
            if (!res.code) {
              console.log('发送成功了', res.data.message)
              resolve(res)
            }
          },
          async (rejects) => {
            console.error('发送被拒绝', rejects)
            // if (!retry) {
            // const res = await this.joinGroup(chatRoomID)
            // console.log(res)
            // resolve(this.sendMessage(chatRoomID, msg, true))
            // }
            resolve(rejects)
          }
        )
        .catch((err) => {
          console.error('发送错误', err)
          reject(err)
        })
    })
  }

  createLikeNumMessage = (likeNum) => {
    const customMessage = tim.createCustomMessage({
      to: this.chatRoomID,
      conversationType: TIM.TYPES.CONV_GROUP,
      payload: {
        data: JSON.stringify({
          proto_name: 'GROUP_LIKE_NUM',
          ver: '1.0',
          content: {
            increase_like_num: likeNum,
            timestamp: new Date().getTime(),
          },
        }),
        description: '点赞消息',
      },
    })

    console.log({ customMessage })
    return customMessage
  }

  createImageMessage(file) {
    let message = tim.createImageMessage({
      to: this.chatRoomID,
      conversationType: TIM.TYPES.CONV_C2C,
      payload: {
        file,
      },
    })

    // 2. 发送消息
    return new Promise((resolve, reject) => {
      let promise = tim.sendMessage(message)
      promise
        .then(function (imResponse) {
          // 发送成功
          console.log(imResponse)
          resolve(imResponse)
        })
        .catch(function (imError) {
          // 发送失败
          console.warn('sendMessage error:', imError)
          reject(imError)
        })
    })
  }

  sendCustomImage(imgType = 255, arr = []) {
    // 图片格式。JPG = 1，GIF = 2，PNG = 3，BMP = 4，其他 = 255
    // arr
    /**
     * {
      "Type": 1,           //原图
      "Size": 1853095,
      "Width": 2448,
      "Height": 3264,
       "URL": "http://img.jk51.com/img_jk51/359290272.jpeg"
    }
     */
    const msg = this.createCustomMessage(this.chatRoomID, {
      data: JSON.stringify({
        proto_name: 'CUSTOM_MSG',
        ver: '1.0',
        content: {
          MsgType: 'TIMImageElem',
          MsgContent: {
            ImageFormat: imgType,
            ImageInfoArray: arr,
          },
          timestamp: Date.now(),
        },
      }),
      description: '自定义图片消息',
    })
    return this.sendCustomGroupMessage(this.chatRoomID, msg)
  }

  createCustomMessage = (
    toUser,
    payload,
    conversationType = TIM.TYPES.CONV_GROUP
  ) => {
    console.log('create custom message::', {
      toUser,
      conversationType,
      payload,
    })
    return tim.createCustomMessage({
      to: toUser,
      conversationType,
      payload,
    })
  }

  sendCustomGroupMessage = (chatRoomId, msg) => {
    console.log('发送群自定义消息', chatRoomId, msg)
    return new Promise((resolve, reject) => {
      tim
        .sendMessage(msg)
        .then(
          (res) => {
            if (!res.code) {
              console.log('发送成功', res.data.message)

              const message = {
                ...res.data.message,
                nick: this.IMOptions.nickName,
                avatar: this.IMOptions.avatar,
              }

              resolve(message)
            }
          },
          (reason) => reject(reason)
        )
        .catch((err) => {
          reject(err)
        })
    })
  }

  readyToDo = (todo) => {
    if (todo) {
      this.unReadyList.push(todo)
    }
    console.log(this.isLogin, this.isSDKReady, 'todo')

    if (this.isLogin && this.isSDKReady && this.unReadyList.length) {
      console.log(this.unReadyList.length, 123132313)
      this.unReadyList.forEach((item) => {
        console.log(item, 'items')
        item && item.call(this)
      })
      this.unReadyList = []
    }
  }

  // 获取用户资料getUserProfile
  getUserProfile = (idList = []) => {
    return tim.getUserProfile({
      userIDList: createArray(idList),
    })
  }

  getGroupMemberList = (page = 0, limit = 30) => {
    return tim.getGroupMemberList({
      groupID: this.chatRoomID,
      count: limit,
      offset: page,
    })
  }

  // /**
  //  *
  //  * @param {*} idList
  //  * @param {*} memberCustomFieldFilter  自定义字段过滤
  //  * @description 获取群成员信息
  //  */
  getGroupUserProfile = (userIDList = [], memberCustomFieldFilter = []) => {
    return tim.getGroupMemberProfile({
      groupID: this.chatRoomID,
      userIDList: createArray(userIDList),
      memberCustomFieldFilter: createArray(memberCustomFieldFilter),
    })
  }
  // 获取群信息
  getGroupProfile = (data) => {
    return tim.getGroupProfile(data)
  }

  // 设置成员禁言
  setGroupMemberMuteTime = (userID, muteTime) => {
    if (muteTime <= 0) {
      console.warn('muteTime 不能小于等于0')
      return Promise.reject(new Error('muteTime 不能小于等于0'))
    }
    return new Promise((resolve, reject) => {
      console.log(tim)

      tim
        .setGroupMemberMuteTime({
          groupID: this.chatRoomID,
          userID,
          muteTime,
        })
        .then((imRes) => {
          console.log('设置禁言成功')
          resolve(imRes.data)
        })
        .catch((imErr) => {
          console.log(`设置${userID}禁言失败`)
          reject(imErr)
        })
    })
  }

  // 取消单个禁言
  cancelGroupMemberMute = (userID) => {
    return this.setGroupMemberMuteTime(userID, 0)
  }

  // 设置所有群成员静音
  setGroupAllMemberMute = () => {
    return tim.updateGroupProfile({
      groupID: this.chatRoomID,
      muteAllMembers: true,
    })
  }

  // 解除所有群成员禁言
  cancelGroupAllMemberMute = () => {
    return tim.updateGroupProfile({
      groupID: this.chatRoomID,
      muteAllMembers: false,
    })
  }

  startHeartBeat = () => {
    console.log('开始发送心跳')
    this.sendHeartBeat(1)
    this.heartBeatInterval = setInterval(() => this.sendHeartBeat(), 30000)
  }

  endHeartBeat = () => {
    console.log('结束发送心跳')
    if (this.heartBeatInterval) {
      clearInterval(this.heartBeatInterval)
      this.heartBeatInterval = null
    }
  }

  sendHeartBeat = (isBegin = 0) => {
    const heartBeatMessage = this.createCustomMessage(this.chatRoomID, {
      data: JSON.stringify({
        proto_name: 'ONLINE_NUM',
        ver: '1.0',
        content: {
          is_begin: isBegin, // 1：第一次发送心跳，0：非第一发送心跳
          heart_beat_info: '',
          timestamp: Date.now(),
        },
      }),
    })

    console.log('发送心跳::', heartBeatMessage)

    this.sendCustomGroupMessage(this.chatRoomID, heartBeatMessage)
  }
}

const IMUtils = new IMUtilsClass()

export default IMUtils
