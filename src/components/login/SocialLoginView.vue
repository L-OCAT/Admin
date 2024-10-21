<template>
  <v-card class="pa-6" elevation="2">
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
    <v-btn
      class="mb-4"
      block
      elevation="1"
      rounded
      color="#000000"
      @click="loginWithApple"
      height="50"
    >
      <v-icon left>mdi-apple</v-icon>
      Sign in with Apple
    </v-btn>
    <v-alert type="error" v-if="errorMessage" dense text="">
      {{ errorMessage }}
    </v-alert>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useAuth } from "@/store/auth";
import { getProperty } from "@/utils/environment";
import { useRoute } from "vue-router";
import { request } from "@/utils/request-client";
import { TokenDto } from "@/types/admin/login-response";

const KAKAO_REDIRECT_URI = getProperty("KAKAO_REDIRECT_URI");

export default defineComponent({
  name: "SocialLoginView",
  setup() {
    const auth = useAuth();
    const route = useRoute();
    const errorMessage = ref("");

    onMounted(() => {
      if (window.location.href.startsWith("http://localhost:3000")) {
        handleOAuthRedirect();
      }
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

    const loginWithApple = async () => {
      try {
        alert("준비 중입니다.");
      } catch (error) {
        errorMessage.value = "Apple 로그인 중 오류가 발생했습니다.";
      }
    };

    const handleOAuthRedirect = () => {
      const oAuthId = route.query.oAuthId as string;
      if (oAuthId) {
        request<TokenDto>("/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            oAuthId: oAuthId,
            nickname: "LOCAT" + Math.floor(Math.random() * 10000),
            isTermsOfServiceAgreed: true,
            isPrivacyPolicyAgreed: true,
            isLocationPolicyAgreed: true,
            isMarketingPolicyAgreed: false,
          }),
        }).then((response) => {
          alert(response);
        });
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
