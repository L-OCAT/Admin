<template>
  <v-app>
    <v-navigation-drawer app permanent width="250">
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img
            src="@/assets/logo.svg"
            alt="Logo"
            max-height="40"
            contain
          ></v-img>
        </v-list-item-avatar>
        <v-list-item-title class="text-h6">LOCAT</v-list-item-title>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          link
          @click="currentView = item.view"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn text="" v-bind="props">
            {{ username }} <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="openSettings">
            <v-list-item-icon><v-icon>mdi-cog</v-icon></v-list-item-icon>
            <v-list-item-title>설정</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-icon><v-icon>mdi-logout</v-icon></v-list-item-icon>
            <v-list-item-title>로그아웃</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn icon>
        <v-icon>mdi-clock-outline</v-icon>
      </v-btn>
      <span class="mr-2">{{ currentTime }}</span>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <component :is="currentView"></component>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { parseJwt } from "@/utils/jwt-parser";

export default defineComponent({
  setup() {
    const currentView = ref("HomeView");
    const username = ref("");
    const userRole = ref("");
    const currentTime = ref("");

    onMounted(() => {
      updateTime();
      timer = setInterval(updateTime, 1000);
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const userDetails = parseJwt(accessToken);
        console.log(userDetails);
        username.value = `${userDetails.name}(${userDetails.sub})`;
        userRole.value = userDetails.auth[0].authority;
      }
    });

    const menuItems = [
      { title: "홈", icon: "mdi-home", view: "HomeView" },
      { title: "유저 관리", icon: "mdi-account", view: "UserManagementView" },
      { title: "게시글 관리", icon: "mdi-post", view: "PostManagementView" },
      { title: "설정", icon: "mdi-cog", view: "SettingsView" },
    ];

    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleTimeString("ko-KR");
    };

    let timer: number;

    const openSettings = () => {
      currentView.value = "SettingsView";
    };

    const logout = () => {
      // 로그아웃 로직 구현
      console.log("로그아웃");
    };

    onUnmounted(() => {
      clearInterval(timer);
    });
    return {
      currentView,
      username,
      currentTime,
      menuItems,
      openSettings,
      logout,
    };
  },
});
</script>

<style scoped>
.v-navigation-drawer {
  background-color: #f5f5f5;
}
</style>
