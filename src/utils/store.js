const data = {}

const get = key => {
  return key ? data[key] : data
}
const set = (key, value) => {
  if (key !== undefined) {
    data[key] = value
  }
}

export default {
  get,
  set
}
