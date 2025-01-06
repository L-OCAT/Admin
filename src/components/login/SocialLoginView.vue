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
    <div class="text-center mb-4 d-flex flex-column align-center">
      <img
        src="/images/kakao_login_medium_narrow.png"
        width="183"
        height="45"
        alt="카카오 로그인 버튼"
        @click="loginWithKakao"
        style="cursor: pointer; margin-bottom: 16px"
      />
      <div
        id="appleid-signin"
        data-mode="center-align"
        data-type="sign-up"
        data-color="black"
        data-border="false"
        data-border-radius="15"
        data-width="183"
        data-height="45"
      ></div>
    </div>
    <v-alert type="error" v-if="errorMessage" dense text="">
      {{ errorMessage }}
    </v-alert>
  </v-card>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { getProperty } from "@/utils/environment";

const KAKAO_REDIRECT_URI = getProperty("KAKAO_REDIRECT_URI");
const APPLE_REDIRECT_URI = getProperty("APPLE_REDIRECT_URI");
const APPLE_CLIENT_ID = getProperty("APPLE_CLIENT_ID");

export default defineComponent({
  name: "SocialLoginView",
  emits: ["update:view"],
  setup() {
    const errorMessage = ref("");

    onMounted(() => {
      initializeAppleSignIn();
    });

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

    const initializeAppleSignIn = () => {
      const script = document.createElement("script");
      script.src =
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/ko_KR/appleid.auth.js";
      script.async = true;
      script.onload = () => {
        window.AppleID?.auth.init({
          clientId: APPLE_CLIENT_ID,
          redirectURI: APPLE_REDIRECT_URI,
          responseMode: "form_post",
          nonce: generateRandomState(),
          usePopup: false,
        });
      };
      document.head.appendChild(script);
    };

    const generateRandomState = () => {
      return Math.random().toString(36).substring(2, 15);
    };

    return {
      loginWithKakao,
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
