const DingRobot = require('ding-robot')
function getIPAdress() {
  var interfaces = require('os').networkInterfaces()
  for (var devName in interfaces) {
    var iface = interfaces[devName]
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i]
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      ) {
        return alias.address
      }
    }
  }
}
var robot = new DingRobot(
  'b9ea95481a204ac12f8788152ce1833102a5a7483d56ef4b549d6d002cfbf05d'
)
var str = `容器启动通知:
    项目: ${process.cwd()}
    time: ${new Date().toLocaleString()}
    ip: ${getIPAdress()}
    hostName: ${require('os').hostname()}
    执行脚本： ${process.env.npm_lifecycle_script}
`
robot.text(str)
