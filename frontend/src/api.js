import axios from 'axios'

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
export const api = axios.create({ baseURL: API_BASE_URL })

export function authConfig() {
  const token = localStorage.getItem('hiresense_token')
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }
}
