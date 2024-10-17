import { defineStore } from "pinia";

export const useAuth = defineStore("auth", {
  state: () => ({
    isLoggedIn: false,
    isPasswordExpired: false,
    needMFA: false,
    userId: "",
  }),
  actions: {
    isAuthenticated() {
      return this.isLoggedIn && !this.isPasswordExpired && !this.needMFA;
    },
    setIsLoggedIn(isLoggedIn: boolean) {
      this.isLoggedIn = isLoggedIn;
    },
    markPasswordAsExpired() {
      this.isPasswordExpired = true;
    },
    requireMFA(isRequired: boolean) {
      this.needMFA = isRequired;
    },
    storeUserId(userId: string) {
      this.userId = userId;
    },
  },
});
