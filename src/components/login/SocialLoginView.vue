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
      <div
        id="appleid-signin"
        data-color="black"
        data-border="true"
        data-type="sign in"
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
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.onload = () => {
        window.AppleID?.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: "name email",
          redirectURI: APPLE_REDIRECT_URI,
          responseMode: "form_post",
          usePopup: true,
        });
      };
      document.head.appendChild(script);
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

#appleid-signin {
  width: 222px !important;
  height: 54px !important;
  margin: 12px auto 0;
}
</style>
