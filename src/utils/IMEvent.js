import IMCommunication from './IMCommunication'
import eventBus from './eventBus'

import {
  HKYIM_GET_GROUP_PROFILE,
  HKYIM_SEND_MESSAGE,
  HKYIM_SEND_MESSAGE_LIKE,
  HKYIM_GET_GROUP_MEMBERLIST,
  HKYIM_GET_MESSAGELIST,
  HKYIM_SEND_CUSTSOM_IMAGE,
  HKYIM_GET_GROUP_USERPROFILE,
  GROUP_LIKE_NUM,
  GROUP_SILENCE,
  GROUP_SHELF_SHOW,
  GROUP_SHELF_HIDE,
  GROUP_COMMON_CONTROL,
  GROUP_EVENT_NOTIFY,
  LIVE_STATUS_CHANGED,
  LIVE_PUSH_ADDR_CHANGED,
  LIVE_PULL_ADDR_CHANGED,
  MULTI_PULL_ADDR_CHANGED,
  MULTI_PUSH_ADDR_CHANGED,
  HKYIM_IM_INLINE_NUM,
  HKYIM_IM_LIKE_NUM,
  HKYIM_IM_LIVE_STATUS,
  HKYIM_IMONMESSAGE,
  HKYIM_PULL_ADDR_CHANGED,
  HKYIM_SWITCH_ONLINENUM,
  HKYIM_GROUP_SHELF_SHOW,
  HKYIM_GROUP_SHELF_HIDE,
  HKYIM_GROUP_COMMON_CONTROL,
  HKYIM_MULTI_PULL_ADDR_CHANGED,
} from '../config/constants'

// IM 中 注册iframe 通信处理事件
export const useDefaultEvent = (context) => {
  // 获取群信息
  IMCommunication.use(HKYIM_GET_GROUP_PROFILE, (data, resolve) => {
    console.log(data, 'getGroupProfile', context.chatRoomID)
    context.getGroupProfile(data).then((res) => {
      resolve(res)
    })
  })
  // 发消息
  IMCommunication.use(HKYIM_SEND_MESSAGE, (data, resolve) => {
    console.log(data, '发消息', context.chatRoomID)
    context.sendMessage(context.chatRoomID, data).then((res) => {
      resolve(res)
    })
  })
  // 点赞消息
  IMCommunication.use(HKYIM_SEND_MESSAGE_LIKE, (data, resolve) => {
    console.log(data, 'createLikeNumMessage')
    const msg = context.createLikeNumMessage(data, context.chatRoomID)
    context.sendCustomGroupMessage(context.chatRoomID, msg).then((res) => {
      resolve(res)
    })
  })
  // 消息列表
  IMCommunication.use(HKYIM_GET_MESSAGELIST, (data, resolve) => {
    console.log(data, 'getMessageList')
    context.readyToDo(() => {
      tim.getMessageList(data).then((res) => {
        console.log(res, '.............')
        resolve(res)
      })
    })
  })

  // memberList 人员列表

  IMCommunication.use(HKYIM_GET_GROUP_MEMBERLIST, (data, resolve) => {
    console.log(data, 'getGroupMemberList')
    context.getGroupMemberList(data.offset, data.count).then((res) => {
      resolve(res)
    })
  })

  // memberList 人员列表信息

  IMCommunication.use(HKYIM_GET_GROUP_USERPROFILE, (data, resolve) => {
    console.log(data, 'HKYIM_GET_GROUP_USERPROFILE')
    context.getGroupUserProfile(data.userIDList).then((res) => {
      resolve(res)
    })
  })
  // 发送图片
  IMCommunication.use(HKYIM_SEND_CUSTSOM_IMAGE, (data, resolve) => {
    console.log(data, 'getGroupMemberList')
    context.sendCustomImage(data.imgType, data.imgArray).then((res) => {
      resolve(res)
    })
  })
}

// im 消息中 userDefinedField 字段处理
export const userDefinedEvent = (context, chatRoomID, msg) => {
  const userDefinedFieldObj = context
  const userDefinedFieldObjContent = userDefinedFieldObj.content
  switch (userDefinedFieldObj.proto_name) {
    case GROUP_EVENT_NOTIFY: {
      // GROUP_EVENT_NOTIFY 群系统通知
      console.log('系统通知::', userDefinedFieldObj)
      const showPosition = userDefinedFieldObj.content.show_position
      if (showPosition === 2 || showPosition === 3) {
        eventBus.dispatch('message', {
          type: HKYIM_IMONMESSAGE,
          data: msg,
        })
        // postMessage.send({
        //   type: HKYIM_IMONMESSAGE,
        //   data: msg,
        // })
      }

      break
    }

    case LIVE_PUSH_ADDR_CHANGED:
      // 推流地址变化，仅对推流老师发送的消息
      eventBus.dispatch('pushAddressChange', {
        type: LIVE_PUSH_ADDR_CHANGED,
        data: userDefinedFieldObjContent,
      })
      break

    case MULTI_PUSH_ADDR_CHANGED:
      // 多机位推流地址已变化
      console.log('多机位推流地址已变化::', userDefinedFieldObj)
      eventBus.dispatch('multiPushAddressChange', {
        type: MULTI_PUSH_ADDR_CHANGED,
        data: userDefinedFieldObjContent,
      })
      break
    case GROUP_LIKE_NUM:
      // 点赞数
      console.log('点赞数::', userDefinedFieldObj)
      eventBus.dispatch('likeNumber', {
        type: GROUP_LIKE_NUM,
        data: userDefinedFieldObjContent,
      })
      //   postMessage.send({
      //     type: HKYIM_IM_LIKE_NUM,
      //     data: userDefinedFieldObjContent,
      //   })
      break
    case LIVE_STATUS_CHANGED:
      // 直播状态
      eventBus.dispatch('liveStatus', {
        type: HKYIM_IM_LIVE_STATUS,
        data: userDefinedFieldObjContent,
      })
      break
    case 'ONLINE_NUM_SWITCH':
      // 人数开关
      console.log('SwithcOnlineNum', userDefinedFieldObj)
      // eslint-disable-next-line camelcase
      eventBus.dispatch('switchOnlineNum', {
        type: HKYIM_SWITCH_ONLINENUM,
        data: userDefinedFieldObjContent,
      })
      break
    case 'ONLINE_NUM':
      // 人数
      console.log('人数')
      eventBus.dispatch('onlineNum', {
        type: HKYIM_IM_INLINE_NUM,
        data: userDefinedFieldObjContent,
      })

      //   postMessage.send({
      //     type: HKYIM_IM_INLINE_NUM,
      //     data: userDefinedFieldObjContent,
      //   })
      break
    case GROUP_SILENCE:
      // 群组禁言
      tim.getGroupProfile({ groupID: chatRoomID }).then((res) => {
        const { group } = res.data
        console.log(group, '群组禁言')
      })

      break

    case LIVE_PULL_ADDR_CHANGED:
      // 拉流地址变化通知
      console.log('拉流地址已变化::', userDefinedFieldObj)
      eventBus.dispatch('pullAddressChange', {
        type: HKYIM_PULL_ADDR_CHANGED,
        data: userDefinedFieldObjContent,
      })

      break

    case MULTI_PULL_ADDR_CHANGED:
      // 多机位拉流地址已变化
      console.log('多机位拉流地址已变化::', userDefinedFieldObj)

      eventBus.dispatch('multiPullAddressChange', {
        type: HKYIM_MULTI_PULL_ADDR_CHANGED,
        data: userDefinedFieldObjContent,
      })

      break

    case GROUP_SHELF_SHOW:
      // 显示货架通知
      console.log('直播货架上架')
      eventBus.dispatch('showShelf', {
        type: HKYIM_GROUP_SHELF_SHOW,
        data: userDefinedFieldObjContent,
      })
      //   postMessage.send({
      //     type: HKYIM_GROUP_SHELF_SHOW,
      //     data: userDefinedFieldObjContent,
      //   })
      break

    case GROUP_SHELF_HIDE:
      // 隐藏货架通知
      console.log('直播货架隐藏货架通知')

      eventBus.dispatch('hideShelf', {
        type: HKYIM_GROUP_SHELF_HIDE,
        data: userDefinedFieldObjContent,
      })
      //   postMessage.send({
      //     type: HKYIM_GROUP_SHELF_HIDE,
      //     data: userDefinedFieldObjContent,
      //   })
      break
    case GROUP_COMMON_CONTROL:
      // GROUP_COMMON_CONTROL特殊消息
      eventBus.dispatch('groupCommonControl', {
        type: HKYIM_GROUP_COMMON_CONTROL,
        data: userDefinedFieldObjContent,
      })
      //   postMessage.send({
      //     type: HKYIM_GROUP_COMMON_CONTROL,
      //     data: userDefinedFieldObjContent,
      //   })
      break
    default:
      break
  }
}

export const groupInfoEvent = (res) => {
  if (res.code === 0) {
    const { group } = res.data
    let groupCustomObj = {}
    group.groupCustomField &&
      group.groupCustomField.forEach((element) => {
        groupCustomObj[element.key] = element.value
      })

    const likeNumber = groupCustomObj.LikeNum || 0
    const switchOnlineNum = groupCustomObj.SwitchOnlineNum || 'Off'
    const shelfInfo = groupCustomObj.ShelfInfo || ''
    const shelfWebUrl = groupCustomObj.ShelfWebUrl || ''
    const shelfMobileUrl = groupCustomObj.ShelfMobileUrl || ''
    // 发送默认开关
    console.log(likeNumber, switchOnlineNum, shelfWebUrl, shelfMobileUrl, shelfInfo, 'groupInfo')
    eventBus.dispatch('switchOnlineNum', {
      type: HKYIM_SWITCH_ONLINENUM,
      data: {
        switch: switchOnlineNum, // On或Off；On表示显示在线人数，Off表示关闭在线人数显示
        online_num: 0,
      },
    })
    eventBus.dispatch('likeNumber', {
      type: HKYIM_SWITCH_ONLINENUM,
      data: likeNumber,
    })
    // 发送默认货架
    if (shelfInfo) {
      const myShelfInfo = {
        ...JSON.parse(shelfInfo).content,
        web_action_url: shelfWebUrl,
        mobile_action_url: shelfMobileUrl,
      }
      eventBus.dispatch('showShelf', {
        type: HKYIM_GROUP_SHELF_SHOW,
        data: myShelfInfo,
      })
    }
  }
}
