import { defineStore } from "pinia";
import { isTokenValid } from "@/utils/token-utils";

export const useAuth = defineStore("auth", {
  state: () => ({
    isLoggedIn: false,
    isPasswordExpired: false,
    needMFA: false,
    userId: "",
  }),
  actions: {
    isAuthenticated() {
      return isTokenValid() && !this.isPasswordExpired;
    },
    setIsLoggedIn(isLoggedIn: boolean) {
      this.isLoggedIn = isLoggedIn;
    },
    markPasswordAsExpired() {
      this.isPasswordExpired = true;
    },
    resolvePasswordExpired() {
      this.isPasswordExpired = false;
    },
    requireMFA(isRequired: boolean) {
      this.needMFA = isRequired;
    },
    storeUserId(userId: string) {
      this.userId = userId;
    },
  },
});
