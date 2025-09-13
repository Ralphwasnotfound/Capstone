// src/stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null, // will hold the logged-in user
  }),
  actions: {
    setUser(userData) {
      this.user = userData
    },
  },
})
