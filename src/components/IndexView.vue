<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    fill-height
  >
    <component
      :is="currentView"
      @update:view="currentView = $event"
    ></component>
  </v-container>
</template>

<script lang="ts">
import {
  defineAsyncComponent,
  defineComponent,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/store/auth";
import { request } from "@/utils/request-client";
import { TokenDto } from "@/types/admin/login-response";

export default defineComponent({
  name: "IndexView",
  components: {
    LoginView: defineAsyncComponent(
      () => import("@/components/login/LoginView.vue")
    ),
    SocialLoginView: defineAsyncComponent(
      () => import("@/components/login/SocialLoginView.vue")
    ),
    PasswordResetView: defineAsyncComponent(
      () => import("@/components/login/PasswordResetView.vue")
    ),
    MfaView: defineAsyncComponent(
      () => import("@/components/login/MfaView.vue")
    ),
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const auth = useAuth();
    const currentView = ref("LoginView");

    onMounted(() => {
      const oAuthId = route.query.oAuthId as string;
      if (oAuthId) {
        handleOAuthRedirect(oAuthId);
      }
    });

    watch(
      () => auth.isAuthenticated(),
      (isAuthenticated) => {
        if (isAuthenticated) {
          router.push({ name: "MainView" });
        }
      }
    );

    watch(
      () => auth.isLoggedIn,
      () => {
        if (auth.isAuthenticated()) {
          router.push({ name: "MainView" });
        }
      }
    );

    watch(
      () => auth.isPasswordExpired,
      (isPasswordExpired) => {
        if (isPasswordExpired) {
          alert("임시 비밀번호를 사용 중입니다. 비밀번호를 변경해주세요.");
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

    const handleOAuthRedirect = (oAuthId: string) => {
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
      })
        .then(() => {
          alert("등록 성공! 기존 관리자가 승인하면 로그인이 가능합니다.");
          router.replace({ name: "IndexView" });
        })
        .catch(() => {
          alert("등록 실패! 관리자에게 문의해주세요.");
          router.replace({ name: "IndexView" });
        });
    };

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
