// api/auth.js：登录相关的请求函数
import { api } from './client.js'

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password })
  return res.data // { token: '...' }
}
