<template>
  <v-app>
    <v-navigation-drawer app permanent width="300">
      <v-container class="d-flex flex-column fill-height pa-0">
        <div class="d-flex align-center justify-center pa-4">
          <v-img
            src="/src/assets/logo.svg"
            alt="Logo"
            width="60"
            height="60"
            class="flex-shrink-0"
          />
          <span class="text-h5 font-weight-bold ml-4 flex-shrink-0">
            LOCAT
          </span>
        </div>
        <v-list dense nav class="flex-grow-1 overflow-y-auto w-100">
          <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            link
            @click="currentView = item.view"
            class="d-flex align-center py-2 pl-4"
          >
            <v-icon size="38" class="mr-3">{{ item.icon }}</v-icon>
            <span class="text-subtitle-1">
              {{ item.title }}
            </span>
          </v-list-item>
        </v-list>
        <div class="pa-2 text-center pl-4">
          <span class="text-caption font-weight-bold"> © Team LOCAT </span>
          <v-spacer></v-spacer>
          <span class="text-caption font-weight-bold">v{{ appVersion }}</span>
          <span class="text-caption">&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span class="text-caption">{{ buildDate }}</span>
          <div
            v-if="isPreRelease"
            class="text-caption text-error mt-1"
            style="font-size: 0.65rem"
          >
            개발 중인 버전으로 일부 오류가 있을 수 있습니다.
          </div>
        </div>
      </v-container>
    </v-navigation-drawer>

    <v-app-bar app dense height="80">
      <v-spacer></v-spacer>

      <div class="d-flex align-center">
        <div class="mr-2">
          <v-btn icon @click="toggleDarkMode">
            <v-icon v-if="isDarkMode">mdi-moon-waning-crescent</v-icon>
            <v-icon v-else>mdi-white-balance-sunny</v-icon>
          </v-btn>
        </div>

        <div class="d-flex flex-column align-center">
          <div class="mb-2">
            <span>{{ currentTime }}</span>
          </div>

          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn
                text=""
                v-bind="props"
                style="color: #ff5f2c; font-weight: bold; text-transform: none"
              >
                {{ username }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="logout">
                <v-list-item-icon><v-icon>mdi-logout</v-icon></v-list-item-icon>
                <v-list-item-title>로그아웃</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <component :is="currentView"></component>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import { invalidateToken, parseJwt } from "@/utils/token-utils";
import { useAppTheme } from "@/store/theme";
import { APP_VERSION, BUILD_DATE } from "@/App.vue";

export default defineComponent({
  name: "MainView",
  components: {
    DashboardView: defineAsyncComponent(
      () => import("@/components/dashboard/DashboardView.vue")
    ),
    UserManageView: defineAsyncComponent(
      () => import("@/components/user/UserManageView.vue")
    ),
    TermsManageView: defineAsyncComponent(
      () => import("@/components/terms/TermsManageView.vue")
    ),
    ServerManageView: defineAsyncComponent(
      () => import("@/components/server/ServerManageView.vue")
    ),
  },

  setup() {
    const appTheme = useAppTheme();
    const currentView = ref("DashboardView");
    const username = ref("");
    const userRole = ref("");
    const currentTime = ref("");
    let timer: number;

    const menuItems = [
      { title: "대시보드", icon: "mdi-view-dashboard", view: "DashboardView" },
      { title: "사용자 관리", icon: "mdi-account", view: "UserManageView" },
      // { title: "게시글 관리", icon: "mdi-text-box", view: "" },
      {
        title: "약관 관리",
        icon: "mdi-file-cog-outline",
        view: "TermsManageView",
      },
      {
        title: "서버 상태 관리",
        icon: "mdi-heart-pulse",
        view: "ServerManageView",
      },
    ];

    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleString("ko-KR");
    };

    const logout = () => {
      invalidateToken();
      document.location.href = "/";
    };

    onMounted(() => {
      appTheme.init();
      updateTime();
      timer = setInterval(updateTime, 1000);

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const userDetails = parseJwt(accessToken);
        username.value = `${userDetails.name}(${userDetails.sub})`;
        userRole.value = userDetails.auth;
      }
    });

    onUnmounted(() => {
      clearInterval(timer);
    });

    const isPreRelease = computed(() => {
      const version = APP_VERSION.toLowerCase();
      return (
        version.includes("alpha") ||
        version.includes("beta") ||
        version.includes("rc") ||
        version.includes("dev")
      );
    });

    return {
      appVersion: APP_VERSION,
      buildDate: BUILD_DATE,
      isPreRelease,
      isDarkMode: computed(() => appTheme.isDarkMode),
      toggleDarkMode: () => appTheme.toggle(),
      currentView,
      menuItems,
      username,
      currentTime,
      logout,
    };
  },
});
</script>
