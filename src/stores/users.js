// src/stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null, // will hold the logged-in user
  }),
  actions: {
    setUser(userData, token = null) {
      this.user = userData
      if (token) {
        this.token = token
        localStorage.setItem('token', token)
      }
      localStorage.setItem('user', JSON.stringify(userData))
    },
    logOut() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    loadUser() {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        this.user = JSON.parse(storedUser)
      }
    }
  },
})
