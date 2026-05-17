import api from './axios'
import type { CommonResponse, LoginResponse, UserMeResponse, TokenRefreshResponse } from '../types'

export const authApi = {
  signUp: (email: string, password: string, nickname: string) =>
    api.post<CommonResponse<string>>('/v1/users/signup', { email, password, nickname }),

  login: (email: string, password: string) =>
    api.post<CommonResponse<LoginResponse>>('/v1/users/login', { email, password }),

  logout: (refreshToken: string) =>
    api.post<CommonResponse<null>>('/v1/users/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    api.post<CommonResponse<TokenRefreshResponse>>('/v1/users/refresh', { refreshToken }),

  getMe: () =>
    api.get<CommonResponse<UserMeResponse>>('/v1/users/me'),
}
