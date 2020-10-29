function ContainerStyle(initOpt, that, styleList) {
  let {
    initWidth,
    initHeight,
    contentBackground,
    closeWidth,
    closeText,
    closeBackgroundUrl,
  } = styleList
  const diaWidth =
    initOpt.dialog && initOpt.dialog.width ? initOpt.dialog.width : initWidth
  const diaHeight =
    initOpt.dialog && initOpt.dialog.height ? initOpt.dialog.height : initHeight
  that.content.style.width = diaWidth
  that.content.style.height = diaHeight + 'px'
  that.content.style.backgroundColor = contentBackground
  that.closeBtn.style.width = closeWidth + 'px'
  that.closeBtn.innerText = closeText
  that.closeBtn.style.backgroundImage = closeBackgroundUrl
}
export default ContainerStyle
