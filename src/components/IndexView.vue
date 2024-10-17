<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    fill-height
  >
    <v-card class="pa-6" elevation="2">
      <component :is="currentView"></component>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/store/auth";

export default defineComponent({
  name: "IndexView",
  components: {
    LoginView: () => import("@/components/login/LoginView.vue"),
    PasswordResetView: () => import("@/components/login/PasswordResetView.vue"),
    MfaView: () => import("@/components/login/MfaView.vue"),
  },
  setup() {
    const router = useRouter();
    const auth = useAuth();
    const currentView = ref("LoginView");

    watch(
      () => auth.isAuthenticated(),
      (isAuthenticated) => {
        if (isAuthenticated) {
          router.push({ name: "MainView" });
        }
      }
    );

    watch(
      () => auth.isPasswordExpired,
      (isPasswordExpired) => {
        if (isPasswordExpired) {
          currentView.value = "PasswordResetView";
        }
      }
    );

    watch(
      () => auth.needMFA,
      (needMFA) => {
        if (needMFA) {
          currentView.value = "MfaView";
        }
      }
    );

    return {
      currentView,
    };
  },
});
</script>

<style scoped>
.v-container {
  min-height: 100vh;
}

.v-card {
  min-width: 500px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #424242;
}

.v-text-field .v-label {
  color: #757575;
}

.v-btn {
  border-radius: 8px;
  box-shadow: none;
  background-color: #ff5f2c;
  color: #fff;
}

.v-card h1 {
  color: #ff5f2c;
}

.timer-text {
  font-size: 0.75rem;
  font-weight: bold;
  color: #ff0000;
}
</style>
