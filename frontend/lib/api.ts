import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const auth = {
  getToken: () => Cookies.get('access_token'),
  setToken: (access: string, refresh: string) => {
    Cookies.set('access_token', access, { expires: 1 / 24 })
    Cookies.set('refresh_token', refresh, { expires: 7 })
  },
  clearToken: () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
  },
  isAuthenticated: () => !!Cookies.get('access_token'),
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}) as AxiosInstance & { auth: typeof auth }

api.auth = auth

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = Cookies.get('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/login/`, { refresh: refreshToken })
          Cookies.set('access_token', data.access)
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return api(originalRequest)
        } catch {
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
      } else {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
