// src/stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null
  }),
  actions: {
    setUser(userData, token = null) {
      this.user = userData
      this.token = token
      if (token) sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(userData))
    },
    logOut() {
      this.user = null
      this.token = null
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    },
    loadUser() {
      const storedUser = sessionStorage.getItem('user')
      const storedToken = sessionStorage.getItem('token')
      if (storedUser) this.user = JSON.parse(storedUser)
      if (storedToken) this.token = storedToken
    }
  }
})
