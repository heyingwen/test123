import { create, $, serialParams } from 'utils'
import doT from 'dot'
import htmlStr from '@/template/IMIframe.html'
import './index.less'
import { IFRAME_URL, URL_BLACKLIST } from '@/config/constants'

const IMIframe = {
  init(opt) {
    this.container =
      typeof opt.container === 'string' ? $(opt.container) : opt.container
    // 设置黑名单
    this.blackList = URL_BLACKLIST
    this.iframeUrl = `${location.protocol}//${IFRAME_URL}` // 当开发环境时 IFRAME_URL = http://127.0.0.1:3020/home 当生产环境 配置生产环境
    this.addIMIframe(opt)
  },
  addIMIframe(opt) {
    let options = Object.assign({}, opt)
    delete options.container
    // 使用dotjs模板引擎
    let urlParams = serialParams(options, false, this.blackList)
    const tempTxt = doT.template(htmlStr)
    const dataSource = {
      url: `${this.iframeUrl}?${urlParams}`,
    }
    const wrapper = create('div', 'hky-im-iframe', tempTxt(dataSource))
    wrapper.id = '__hkyim-iframe-wrapper__'
    this.container.appendChild(wrapper)
    this.wrapper = wrapper
  },
  addEvents() {},
}
export default IMIframe
