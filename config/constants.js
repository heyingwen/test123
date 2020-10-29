import { resolvePath } from './path'
// SDK名称
const NAME_SPACE = 'HKYIM'
const PORT = 3006
const SRC_DIR = resolvePath('src')
const BUILD_DIR = resolvePath('build')

const THIRD_PARTY = ['lib-generate-test-usersig.js']

// SDK运行选项
const SDKOptions = {
  container: '#container',
  userID: '',
  userSig: '',
  roomID: '',
  role: 1, // 1: 教师，2：助教，3：班主任，4：学生
}
// SDK运行代码
const SDK_EXE = `${NAME_SPACE}.init(${JSON.stringify(SDKOptions)})`

export { PORT, SRC_DIR, BUILD_DIR, SDK_EXE, NAME_SPACE, THIRD_PARTY }
