import {
  create,
  mapElements,
  isUrl,
  isMobile,
  getIframe,
  isHKYClient,
  $,
} from 'utils'
import doT from 'dot'
import htmlStr from '@/template/ActivityDialog.html'
import './index.less'
import {
  SPECIAL_MESSAGE,
  CALLBACK_MESSAGE,
  IM_CALLBACK_MESSAGE,
  SPECIAL_MESSAGE_TYPES,
  IM_CALLBACK_ASK_BEHAVIOR,
  HKYIM_TAB_ACTIVITY,
  HKYIM_TAB_ASK,
} from '@/config/constants'
import ContainerStyle from './changeStyle'
import eventBus from '../../utils/eventBus'
import {isJSONString} from 'utils/index'

const ActivityDialog = {
  initData: {
    activeType: '',
  },

  init(opt) {
    this._opt = opt
    this.addDialog()
    this.addEvents(opt)
  },
  addDialog() {
    // 使用dotjs模板引擎
    const tempTxt = doT.template(htmlStr)
    const dataSource = {}
    const wrapper = create('div', 'hky-im-dialog', tempTxt(dataSource))
    let map = {}
    if (isMobile) {
      wrapper.id = '__m-hky-im-dialog__'
      map = {
        closeBtn: '.m-imd-close',
        content: '.m-im-dlg-content',
        iframe: '#__m-hkyim-act-iframe__',
        previewImg: '.act-preview',
        previewImgM: '.act-preview img',
      }
    } else {
      wrapper.id = '__hky-im-dialog__'
      map = {
        closeBtn: '.imd-close',
        content: '.im-dlg-content',
        iframe: '#__hkyim-act-iframe__',
        previewImgPc: '.act-preview-pc',
        previewImgPcContainer: '.act-preview-container',
      }
    }
    document.body.appendChild(wrapper)
    this.wrapper = wrapper
    mapElements(wrapper, map, this)
  },
  show() {
    this.wrapper.classList.add('show')
  },
  hide() {
    this.wrapper.classList.remove('show')
    this.wrapper.classList.remove('show')
    this.iframe.src = ''
  },
  hasTabKey(key) {
    if (window.HKYIM.tabList) {
      return window.HKYIM.tabList.find((item) => {
        return item.key === key
      })
    } else {
      return true
    }
  },
  addEvents(opt) {
    // SPECIAL_MESSAGE

    window.addEventListener('message', (e) => {
      let data = e.data
      console.log(data, '1234消息')
      if (isJSONString(data)) {
        data = JSON.parse(data)
      }
      if (data && data.type === SPECIAL_MESSAGE) {
        console.log(e, 'sdk回传消息')
        this.iframe.style.display = 'block'
        this.wrapper.classList.remove('im-dlg-wrapper-preview')
        this.previewImgPcContainer &&
        (this.previewImgPcContainer.style.display = 'none')
        this.previewImg &&
        (this.previewImg.style.display = 'none')
        console.log(
          this.hasTabKey(HKYIM_TAB_ASK),
          this.hasTabKey(HKYIM_TAB_ACTIVITY)
        )
        if (
          (data.eventType === SPECIAL_MESSAGE_TYPES.ACTIVITY) ||
          (data.eventType === SPECIAL_MESSAGE_TYPES.ASK)
        ) {
          this.receiveMessage(opt, data)
        }
      } else if (data && data.type === CALLBACK_MESSAGE) {
        console.log(e, 'sdk回调消息')
        this.callbackMessage(data)
      } else if (data.type === 'IMG_PRELOAD') {
        // this.iframe.src = data.data.URL
        this.wrapper.classList.add('im-dlg-wrapper-preview')
        ContainerStyle(this._opt, this, {
          initWidth: isMobile ? '100%' : '800px',
          initHeight: isMobile ? window.HKYIM.IMIframeHeight : window.innerHeight * 0.85,
          closeText: '',
        })
        if (this.previewImgPc) {
          this.iframe.style.display = 'none'
          this.previewImgPcContainer.style.width = '100%'
          this.previewImgPcContainer.style.display = 'block'
          this.previewImgPc.src = data.data.URL
        }
        if (this.previewImg) {
          this.iframe.style.display = 'none'
          this.content.style.width = '100%'
          this.previewImg.style.display = 'block'
          this.previewImgM.src = data.data.URL
        }

        this.show()
      }
      // 2020.8.19 添加弹窗返回信息处理
      if (data && data.target === 'ad') {
        switch (data.action) {
          case 'close': // 关闭弹窗
            this.closeBtn && this.closeBtn.click()
            break
          default:
            break
        }
      }
    })
    // 关闭弹窗
    this.closeBtn.addEventListener('click', () => {
      this.hide()
      this.iframe.style.display = 'block'
      // this.content.style.width = '100%'
      if (this.previewImg) {
        this.previewImg.style.display = 'none'
        if(this.previewImgPcContainer) {
          this.previewImgPcContainer.style.display = 'none'
        }
      }
      this.wrapper.classList.remove('im-dlg-wrapper-preview')
    })
  },
  // 接收im消息
  async receiveMessage(opt, data) {
    console.log(data, '收到消息')
    // 2020.8.25 未登录也应该收到群发红包
    if (!opt.isGuest || data.eventType === SPECIAL_MESSAGE_TYPES.ACTIVITY) {
      this.initData.activeType = data.eventType
      let actionUrl = ''
      if (isMobile) {
        actionUrl = data.message.mobile_action_url
      } else {
        actionUrl = data.message.web_action_url
      }
      if (isUrl(actionUrl)) {
        this.iframe.src = actionUrl
      } else {
        this.iframe.src = actionUrl ? '//' + actionUrl : ''
      }

      const styles = await this.changeStyle(opt, data)

      if (
        this.initData.activeType === SPECIAL_MESSAGE_TYPES.ASK &&
        isHKYClient()
      ) {
        const {initWidth, initHeight} = styles
        eventBus.dispatch('openModal', {
          data: {
            url: this.iframe.src,
            width: String(initWidth).replace('px', ''),
            height: String(initWidth).replace('px', ''),
          },
        })
      } else {
        setTimeout(() => {
          this.show()
        }, 300)
      }
    }
  },
  // 活动消息回调
  callbackMessage(e) {
    if (e.behavior === 'close') {
      this.hide()
    } else if (e.behavior === 'submitted') {
      let data = {
        type: IM_CALLBACK_MESSAGE,
        behavior: IM_CALLBACK_ASK_BEHAVIOR,
      }
      let imIframe = getIframe()
      imIframe.contentWindow.postMessage(data, '*')
      this.hide()
    }
  },
  // 自定义弹窗容器宽高
  async changeStyle(opt) {
    let styleList = {}
    let initWidth
    let initHeight
    let wrapperWidth
    let wrapperHeight
    let contentBackground
    if (isMobile) {
      let imIframe = $('#__hkyim-iframe-wrapper__')
      imIframe[0] ? (imIframe = imIframe[0]) : null
      wrapperWidth = imIframe.clientWidth - 32
      wrapperHeight = window.HKYIM.IMIframeHeight
        ? window.HKYIM.IMIframeHeight
        : imIframe.clientHeight
      // alert(wrapperHeight)
      console.log(window.HKYIM.IMIframeHeight, wrapperHeight)
    }

    switch (this.initData.activeType) {
      case SPECIAL_MESSAGE_TYPES.ASK:
        if (isMobile) {
          initWidth = '100%'
          initHeight = wrapperHeight
        } else {
          initWidth = '480px'
          initHeight = 601
        }
        styleList = {
          initWidth,
          initHeight,
          closeWidth: 24,
          contentBackground: contentBackground || '#272727',
          closeText: '',
          closeBackgroundUrl:
            'url(https://img.kaikeba.com/a/41747182400202ibtp.png)',
        }
        ContainerStyle(opt, this, styleList)
        break
      case SPECIAL_MESSAGE_TYPES.ACTIVITY:
        if (isMobile) {
          console.log({wrapperHeight, wrapperWidth})
          styleList = {
            initWidth: '100%',
            initHeight: wrapperHeight,
            closeWidth: 24,
            contentBackground: 'rgba(39, 39, 39, .6)',
            closeText: '',
            closeBackgroundUrl:
              'url(https://img.kaikeba.com/a/41747182400202ibtp.png)',
          }
        } else {
          styleList = {
            initWidth: '509px',
            initHeight: 643,
            closeWidth: 50,
            contentBackground: 'transparent',
            closeText: '关闭',
            closeBackgroundUrl:
              'url(https://img.kaikeba.com/a/70325182400202wgam.png)',
          }
        }
        console.log(styleList)
        ContainerStyle(opt, this, styleList)
        break
      default:
        break
    }

    return styleList
  },
}
export default ActivityDialog
