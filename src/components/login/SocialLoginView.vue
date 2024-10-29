<template>
  <v-card class="pa-6" elevation="2">
    <div class="d-flex align-center mb-6">
      <v-btn icon small class="mr-2" @click="$emit('update:view', 'LoginView')">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </div>
    <h1 class="text-center mb-6" style="font-weight: bold; font-size: 24px">
      LOCAT Admin Console
    </h1>
    <div class="text-center mb-4">
      <img
        src="https://k.kakaocdn.net/14/dn/btroDszwNrM/I6efHub1SN5KCJqLm1Ovx1/o.jpg"
        width="222"
        alt="카카오 로그인 버튼"
        @click="loginWithKakao"
        style="cursor: pointer"
      />
    </div>
    <v-alert type="error" v-if="errorMessage" dense text="">
      {{ errorMessage }}
    </v-alert>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { getProperty } from "@/utils/environment";

const KAKAO_REDIRECT_URI = getProperty("KAKAO_REDIRECT_URI");

export default defineComponent({
  name: "SocialLoginView",
  emits: ["update:view"],
  setup() {
    const errorMessage = ref("");

    const loginWithKakao = async () => {
      try {
        window.Kakao.Auth.authorize({
          throughTalk: true,
          redirectUri: KAKAO_REDIRECT_URI,
        });
      } catch (error) {
        errorMessage.value = "카카오 로그인 중 오류가 발생했습니다.";
      }
    };

    const loginWithApple = async () => {
      try {
        alert("준비 중입니다.");
      } catch (error) {
        errorMessage.value = "Apple 로그인 중 오류가 발생했습니다.";
      }
    };

    return {
      loginWithKakao,
      loginWithApple,
      errorMessage,
    };
  },
});
</script>

<style scoped>
.v-card {
  min-width: 500px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #ff5f2c;
}

.v-btn {
  border-radius: 8px;
  box-shadow: none;
  color: #000000;
  font-weight: bold;
}

.v-btn:first-child {
  background-color: #fee500;
}

.v-btn:last-child {
  background-color: #ffffff;
  border: 1px solid #000000;
}
</style>
