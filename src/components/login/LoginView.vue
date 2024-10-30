<template>
  <v-card class="pa-6" elevation="2">
    <h1 class="text-center mb-6" style="font-weight: bold; font-size: 24px">
      LOCAT Admin Console
    </h1>
    <v-form @submit.prevent="login">
      <v-text-field
        class="mb-4"
        v-model="userId"
        label="Admin ID"
        outlined
        dense
        prepend-inner-icon="mdi-account"
        @keyup.enter="login"
      ></v-text-field>
      <v-text-field
        class="mb-4"
        v-model="password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        outlined
        dense
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="togglePasswordVisibility"
        @keyup.enter="login"
      ></v-text-field>
      <v-alert type="error" v-if="errorMessage" dense text="">
        {{ errorMessage }}
      </v-alert>
      <v-btn class="mt-6" block elevation="1" rounded @click="login">
        로그인
      </v-btn>
      <div class="text-center mt-6">
        <span class="divider-text">또는</span>
      </div>
      <v-btn
        text=""
        block
        class="mt-4 social-login-btn"
        @click="$emit('update:view', 'SocialLoginView')"
        height="44"
      >
        <v-icon left color="#666666" size="20">mdi-account-group</v-icon>
        <span>소셜 로그인으로 계속하기</span>
      </v-btn>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { PUBLIC_API_KEY, request } from "@/utils/request-client";
import { LoginResponse } from "@/types/admin/login-response";
import { useAuth } from "@/store/auth";
import { BaseResponse } from "@/types/common/response";

export default defineComponent({
  name: "LoginView",
  emits: ["update:view"],
  setup() {
    const auth = useAuth();

    onMounted(async () => {
      const fingerPrint = await FingerprintJS.load();
      deviceId.value = (await fingerPrint.get()).visitorId;
    });

    const showPassword = ref(false);
    const deviceId = ref("");
    const userId = ref("");
    const password = ref("");
    const loginErrorMessage = ref("");

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const login = async () => {
      if (!userId.value || !password.value) {
        loginErrorMessage.value = "아이디와 비밀번호를 입력해주세요.";
        return;
      }
      try {
        const response = await request<BaseResponse<LoginResponse>>(
          "/v1/auth/admin/token",
          {
            method: "POST",
            data: JSON.stringify({
              deviceId: deviceId.value,
              userId: userId.value,
              password: password.value,
            }),
            headers: {
              "Content-Type": "application/json",
              "Locat-Api-Key": PUBLIC_API_KEY,
            },
          }
        );

        if (response.data) {
          auth.storeUserId(userId.value);
          if (response.data.isPasswordExpired) {
            auth.markPasswordAsExpired();
          } else {
            localStorage.setItem(
              "accessToken",
              response.data.token.accessToken
            );
            localStorage.setItem(
              "refreshToken",
              response.data.token.refreshToken
            );
            auth.setIsLoggedIn(true);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === "401") {
          loginErrorMessage.value = "아이디 또는 비밀번호가 올바르지 않습니다.";
        } else {
          loginErrorMessage.value = "로그인 중 오류가 발생했습니다.";
        }
      }
    };

    return {
      login,
      userId,
      password,
      errorMessage: loginErrorMessage,
      showPassword,
      togglePasswordVisibility,
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

.primary-login-btn {
  background-color: #ff5f2c !important;
  color: white !important;
  font-size: 1rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.divider-text {
  position: relative;
  color: #999;
  font-size: 0.875rem;
  padding: 0 12px;
}

.divider-text::before,
.divider-text::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 80px;
  height: 1px;
  background-color: #e0e0e0;
}

.divider-text::before {
  right: 100%;
}

.divider-text::after {
  left: 100%;
}

.social-login-btn {
  color: #666666 !important;
  background-color: transparent !important;
  border: 1px solid #e0e0e0 !important;
  font-size: 0.9rem;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  transition: all 0.2s ease;
}

.social-login-btn:hover {
  background-color: #f5f5f5 !important;
  border-color: #d0d0d0 !important;
}

.social-login-btn .v-icon {
  margin-right: 8px;
}
</style>
