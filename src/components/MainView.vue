<template>
  <v-app>
    <v-navigation-drawer app permanent width="300">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        "
      >
        <v-img
          src="@/assets/logo.svg"
          alt="Logo"
          style="flex: none; height: 60px; width: 60px"
        />
        <span
          style="
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            white-space: nowrap;
            line-height: 50px;
            margin-left: 15px;
          "
        >
          LOCAT
        </span>
      </div>

      <v-list dense nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          link
          @click="currentView = item.view"
          class="d-flex align-center"
          style="padding: 8px 16px"
        >
          <v-icon size="38" class="mr-3" style="vertical-align: middle">{{
            item.icon
          }}</v-icon>
          <span
            style="
              font-size: 1.125rem;
              margin-left: 8px;
              white-space: nowrap;
              vertical-align: middle;
            "
          >
            {{ item.title }}
          </span>
        </v-list-item>
      </v-list>
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
                style="color: #ff5f2c; font-weight: bold"
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
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { invalidateToken, parseJwt } from "@/utils/token-utils";
import { useAppTheme } from "@/store/theme";

export default defineComponent({
  name: "MainView",
  setup() {
    const appTheme = useAppTheme();
    const currentView = ref("MainView");
    const username = ref("");
    const userRole = ref("");
    const currentTime = ref("");

    onMounted(() => {
      appTheme.init();
      updateTime();
      timer = setInterval(updateTime, 1000);
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const userDetails = parseJwt(accessToken);
        username.value = `${userDetails.name}(${userDetails.sub})`;
        userRole.value = userDetails.auth[0].authority;
      }
    });

    const menuItems = [
      { title: "홈", icon: "mdi-home", view: "MainView" },
      { title: "사용자 관리", icon: "mdi-account", view: "UserManagementView" },
      { title: "게시글 관리", icon: "mdi-post", view: "PostManagementView" },
    ];

    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleString("ko-KR");
    };

    let timer: number;

    const logout = () => {
      // 로그아웃 로직 구현
      console.log("로그아웃");
      invalidateToken();
      document.location.href = "/";
    };

    onUnmounted(() => {
      clearInterval(timer);
    });
    return {
      isDarkMode: computed(() => appTheme.isDarkMode),
      toggleDarkMode: appTheme.toggle(),
      currentView,
      username,
      currentTime,
      menuItems,
      logout,
    };
  },
});
</script>
