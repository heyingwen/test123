
// window.setInterval(() => {
//   const msg = {
//     ID: `@TIM#SYSTEM-${Math.random() * 10000000}`,
//     avatar: '',
//     clientSequence: 11476,
//     conversationID: '@TIM#SYSTEM',
//     conversationSubType: undefined,
//     conversationType: '@TIM#SYSTEM',
//     flow: 'in',
//     from: '@TIM#SYSTEM',
//     geo: {},
//     isPeerRead: false,
//     isPlaceMessage: 0,
//     isRead: false,
//     isResend: false,
//     isRevoked: false,
//     isSystemMessage: true,
//     nick: '',
//     payload: {
//       groupProfile: {
//         from: '@TIM#SYSTEM',
//         to: '3270435',
//         name: '测试红包',
//         groupID: '@TGS#3KPTGBSGT',
//       },
//       messageKey: 1593661690407,
//       operationType: 255,
//       operatorID: 'administrator',
//       userDefinedField: JSON.stringify({
//         proto_name: 'GROUP_EVENT_NOTIFY',
//         ver: '1.0',
//         content: {
//           tim_group_id: '@TGS#3OMXYFJGG',
//           event_type: parseInt(Math.random() * 2, 10) + 1,
//           show_position: 1,
//           show_style: 1,
//           notify_msg: {
//             nickname: '德玛西亚',
//             template_msg: '\u8d2d\u4e70\u4e86',
//             name: '一个大宝剑',
//           },
//           timestamp: 1593607197,
//         },
//       }),
//     },
//     priority: 'Normal',
//     protocol: 'JSON',
//     random: 1687455430,
//     sequence: 1175709376,
//     status: 'success',
//     time: 1593661690,
//     to: '@TGS#3KPTGBSGT',
//   }
//   // store.dispatch.message.addMessage({
//   //   message: msg,
//   //   selfSend: 0,
//   // })
//   postMessage.send({
//     type: HKYIM_IMONMESSAGE,
//     data: msg,
//   })
// }, 10000)
let allcount = 0
/*
setTimeout(() => {
  const add = () => {
    for (let i = 0; i < Math.ceil(Math.random() * 10); i++) {
      allcount++
      const msggg = {
        ID: `@TIM#SYSTEM-${Math.random()}--`,
        avatar: '',
        clientSequence: 11476,
        conversationID: 'GROUP@TGS#3CQAC2RGD',
        conversationSubType: undefined,
        conversationType: 'GROUP@TGS#3CQAC2RGD',
        flow: 'in',
        from: '@TIM#SYSTEM',
        geo: {},
        isPeerRead: false,
        isPlaceMessage: 0,
        isRead: false,
        isResend: false,
        isRevoked: false,
        isSystemMessage: true,
        nick: '',
        payload: {
          groupProfile: {
            from: '@TIM#SYSTEM',
            to: '3270435',
            name: '测试红包',
            groupID: '@TGS#3CQAC2RGD',
          },
          messageKey: 1593661690407,
          operationType: 255,
          operatorID: 'administrator',
          userDefinedField: JSON.stringify({
            proto_name: 'GROUP_EVENT_NOTIFY',
            ver: '1.0',
            content: {
              tim_group_id: '@TGS#3CQAC2RGD',
              event_type: parseInt(Math.random() * 2, 10) + 1,
              show_position: 1,
              show_style: 1,
              notify_msg: {
                nickname: '德玛西亚',
                template_msg: '\u8d2d\u4e70\u4e86',
                name: `一个大宝剑${allcount}`,
              },
              timestamp: 1593607197,
            },
          }),
        },
        priority: 'Normal',
        protocol: 'JSON',
        random: 1687455430,
        sequence: 1175709376,
        status: 'success',
        time: 1593661690,
        to: '@TGS#3CQAC2RGD',
      }

      MSGBuffer.addMessage(msggg)
    }
  }

  for (let i = 0; i < 1000; i++) {
    ;(idx => {
      setTimeout(() => {
        add()
      }, idx * 50)
    })(i)
  }
}, 5000)
*/