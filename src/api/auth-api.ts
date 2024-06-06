import { instance } from './instance'
import { LoginParamsType, ResponseType } from './todolists-api'

export const authAPI = {
  login(data: LoginParamsType) {
    const promise = instance.post<ResponseType<{ userId?: number }>>('auth/login', data)
    return promise
  },
  logout() {
    const promise = instance.delete<ResponseType<{ userId?: number }>>('auth/login')
    return promise
  },
  me() {
    const promise =
      instance.get<ResponseType<{ id: number; email: string; login: string }>>('auth/me')
    return promise
  },
}
