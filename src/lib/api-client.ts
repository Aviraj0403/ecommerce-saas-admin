import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6005'
const TENANT_ID = import.meta.env.VITE_TENANT_ID || ''

export const apiClient = axios.create({
  baseURL: `${API_URL}/v1/api`,
  headers: {
    'Content-Type': 'application/json',
    'X-Project-ID': TENANT_ID,
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
