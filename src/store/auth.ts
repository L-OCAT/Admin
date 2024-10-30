import { defineStore } from "pinia";
import { isTokenValid, parseJwt } from "@/utils/token-utils";

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
    getAuthority() {
      return (
        parseJwt(localStorage.getItem("accessToken") as string).auth || "NONE"
      );
    },
    isSuperAdmin() {
      return this.getAuthority() === "SUPER_ADMIN";
    },
  },
});
