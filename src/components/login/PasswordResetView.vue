<template>
  <v-card class="pa-6" elevation="2">
    <h1 class="text-center mb-6" style="font-weight: bold; font-size: 24px">
      비밀번호 재설정
    </h1>
    <v-form>
      <v-text-field
        v-model="newPassword"
        label="새 비밀번호"
        :type="showNewPassword ? 'text' : 'password'"
        outlined
        dense
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="toggleNewPasswordVisibility"
        class="mb-4"
      ></v-text-field>
      <v-text-field
        v-model="confirmPassword"
        label="새 비밀번호 확인"
        :type="showConfirmPassword ? 'text' : 'password'"
        outlined
        dense
        prepend-inner-icon="mdi-lock-check"
        :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="toggleConfirmPasswordVisibility"
        class="mb-4"
      ></v-text-field>
      <v-alert type="error" v-if="passwordResetErrorMessage" dense text="">
        {{ passwordResetErrorMessage }}
      </v-alert>
      <v-btn class="mt-6" block elevation="1" rounded @click="resetPassword">
        비밀번호 변경
      </v-btn>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { request } from "@/utils/request-client";
import { useAuth } from "@/store/auth";

export default defineComponent({
  name: "PasswordResetView",
  setup() {
    const auth = useAuth();

    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);

    const toggleNewPasswordVisibility = () => {
      showNewPassword.value = !showNewPassword.value;
    };
    const toggleConfirmPasswordVisibility = () => {
      showConfirmPassword.value = !showConfirmPassword.value;
    };

    const newPassword = ref("");
    const confirmPassword = ref("");
    const passwordResetErrorMessage = ref("");
    const resetPassword = async () => {
      // 입력값 검증
      if (newPassword.value.length < 8) {
        passwordResetErrorMessage.value =
          "새 비밀번호는 8자 이상이어야 합니다.";
        return;
      }
      if (newPassword.value !== confirmPassword.value) {
        passwordResetErrorMessage.value =
          "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.";
        return;
      }
      // 비밀번호 재설정 요청
      request<{ success: boolean }>("/v1/admin/reset-password", {
        method: "POST",
        data: JSON.stringify({
          userId: auth.userId,
          newPassword: newPassword.value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response) {
            alert("비밀번호가 성공적으로 재설정되었습니다.");
            auth.resolvePasswordExpired();
          }
        })
        .catch(() => {
          passwordResetErrorMessage.value = "비밀번호 재설정에 실패했습니다.";
        });
    };

    return {
      showNewPassword,
      showConfirmPassword,
      toggleNewPasswordVisibility,
      toggleConfirmPasswordVisibility,
      newPassword,
      confirmPassword,
      passwordResetErrorMessage,
      resetPassword,
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
