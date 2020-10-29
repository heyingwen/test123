/**
 * @author 杨欣
 * @date 2020-07-16 21:44
 */
import './index.less'
import doT from 'dot'
import htmlStr from '@/template/ShelfDisplay.html'
import {create, isMobile} from 'utils'
import eventBus from 'utils/eventBus'
import {SDK_SHELF_CLICK_EVENT} from 'config/constants'

const ShelfDisplay = {
  data: {
    activated: false,
    container: null,
    currentShelf: null,
    preventDefaultClick: false,
    dispatchUrl: false,
    shelfHide: true,
  },
  init(opt) {
    this.data.container = opt.container
    this.data.activated = opt.showShelf
  },
  removeShelf() {
    const {
      currentShelf,
      container,
    } = this.data

    if (currentShelf && container) {
      container.removeChild(currentShelf)
      this.data.currentShelf = null
    }
  },
  /**
   * @typedef ShowSelfMsg
   * @description 显示货架内容格式
   * @author yang xin
   * @property {string} tim_group_id
   * @property {string} shelf_id : 货架ID
   * @property {string} title : 标题
   * @property {string} web_action_url : 带货链接
   * @property {string} mobile_action_url: 带货链接
   * @property {number} show_way: 展现方式，预留字段，默认值为1
   * @property {number} entrance_style: 货架入口展现方式：1为文本，2为图片
   * @property {string} entrance_content: 货架入口展现内容，跟据entrance_style值展现：1为文本，2为图片地址
   * @property {number} timestamp
   */
  /**
   * @description 显示货架内容的方法
   * @author yang xin
   * @param {{target: {data: ShowSelfMsg}}} msg: 从IM获得的显示货架的信息内容
   */
  showShelf(msg) {
    const {
      container,
      shelfHide
    } = this.data

    const {target: {data}} = msg
    this.removeShelf()
    // debugger
    if (container) {
      // debugger
      const tempTxt = doT.template(htmlStr)
      const dataSource = {
        textClass: data.entrance_style === 1 ? 'text' : '',
        url: isMobile ? data.mobile_action_url : data.web_action_url,
        type: data.entrance_style === 1 ? 'text' : 'pic',
        content: data.entrance_content,
        showWay: data.show_way
      }

      const wrapper = create('div', '', tempTxt(dataSource))
      wrapper.id = 'im-dlg-shelf-wrapper'
      wrapper.className = shelfHide ? 'hide' : ''


      const element = container.appendChild(wrapper)
      console.log('element mounted::', element)
      element.addEventListener('click', (e) => {
        console.log('wrapper click', e)
        if (this.data.preventDefaultClick) {
          e.preventDefault()
        }
        if (this.data.dispatchUrl) {
          eventBus.dispatch(SDK_SHELF_CLICK_EVENT, {
            data: dataSource
          })
        }

      })
      this.data.currentShelf = wrapper
    }

  },
  hideShelf(msg) {
    this.removeShelf()
  },
  setListenClick(flag) {
    if (flag) {
      this.data.preventDefaultClick = true
      this.data.dispatchUrl = true
    }
  },
  setShelfVisibility(event) {
    if (event.target && event.target.data) {
      const visible = event.target.data
      this.data.shelfHide = !visible
      if (this.data.currentShelf) {
        console.log(this.data.currentShelf.classList)
      }
    }

  }
}

export default ShelfDisplay
