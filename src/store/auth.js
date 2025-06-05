import { defineStore } from 'pinia'
import api from '../services/api'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async login(loginData) {
      const response = await api.post('authentication', loginData)
      const {token, user} = response.data
      this.token = token

      localStorage.setItem('token', this.token)
      localStorage.setItem('userId', user)
      router.push(`contatos?usuarioId=${localStorage.getItem('userId')}`)
    },
    logout() {
      this.token = null
      localStorage.removeItem('token')
      router.push('/login')
    },
  },
})
