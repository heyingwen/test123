const fetch = window.fetch
const request = function (options) {
  options = options || {}
  options.baseUrl = options.baseUrl || ''
  options.credentials = options.credentials || 'omit'
  return connection(
    options.method,
    options.baseUrl + options.url,
    options.data || null,
    options
  )
}

const connection = function (type, url, data, options) {
  return new Promise((resolve, reject) => {
    const featuredUrl = getUrlWithData(url, data, type)
    const headers = getHeaders(options.headers, data)
    const init = {
      method: options.method,
      headers,
      credentials: options.credentials,
    }
    if (options.method !== 'get') {
      init['Content-Type'] = 'application/x-www-form-urlencoded'
      init.body = data ? JSON.stringify(data) : ''
    }
    fetch(featuredUrl, init)
      .then((res) => {
        if (res.ok) {
          try {
            res.json().then((data) => {
              resolve(data)
            })
          } catch (e) {
            reject(res)
          }
        } else {
          reject(res)
        }
      })
      .catch((res) => {
        reject(res)
      })
  })
}

function getUrlWithData(url, data, type) {
  if (type.toLowerCase() !== 'get' || !data) {
    return url
  }
  const dataAsQueryString = objectToQueryString(data)
  const queryStringSeparator = url.indexOf('?') > -1 ? '&' : '?'
  return url + queryStringSeparator + dataAsQueryString
}
function objectToQueryString(data) {
  return isObject(data) ? getQueryString(data) : data
}

function isObject(data) {
  return Object.prototype.toString.call(data) === '[object Object]'
}

function getQueryString(obj, prefix) {
  return Object.keys(obj)
    .map(function (key) {
      if (Object.hasOwnProperty.call(obj, key) && undefined !== obj[key]) {
        const val = obj[key]
        key = prefix ? prefix + '[' + key + ']' : key
        return val !== null && typeof val === 'object'
          ? getQueryString(val, key)
          : encode(key) + '=' + encode(val)
      }
    })
    .filter(Boolean)
    .join('&')
}
function hasContentType(headers) {
  return Object.keys(headers).some(function (name) {
    return name.toLowerCase() === 'content-type'
  })
}

function getHeaders(headers, data) {
  headers = headers || {}
  if (!hasContentType(headers)) {
    headers['Content-Type'] = isObject(data)
      ? 'application/json'
      : 'application/x-www-form-urlencoded'
  }
  return new Headers(headers)
}

function encode(value) {
  return encodeURIComponent(value)
}
const get = function (options) {
  return request({
    method: 'get',
    ...options,
  })
}
const post = function (options) {
  return request({
    method: 'post',
    ...options,
  })
}
export { request, get, post }
