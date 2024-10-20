<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuth } from "@/store/auth";
import { useRouter } from "vue-router";
import { getProperty } from "@/utils/environment";

export const APP_NAME = getProperty("APP_NAME");
export const APP_VERSION = getProperty("APP_VERSION");
export const BUILD_DATE = getProperty("APP_BUILD_DATE");

export default defineComponent({
  name: "App",
  setup() {
    const router = useRouter();
    const auth = useAuth();

    router.beforeEach((to, from, next) => {
      document.title = (to.meta.title as string) || APP_NAME;

      const requiresAuth = to.matched.some(
        (record) => record.meta.requiresAuth !== false
      );

      if (requiresAuth && !auth.isAuthenticated()) {
        alert("인증이 필요한 페이지입니다.");
        return next({ name: "IndexView" });
      }

      if (to.name === "IndexView" && auth.isAuthenticated()) {
        return next({ name: "MainView" });
      }

      next();
    });
    return { auth };
  },
});
</script>

<style>
* {
  font-family: "Noto Sans KR", sans-serif !important;
}
</style>
