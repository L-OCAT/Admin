<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    fill-height
  >
    <!-- Login View -->
    <v-card v-if="!isPasswordExpired && !needMFA" class="pa-6" elevation="2">
      <h1 class="text-center mb-6" style="font-weight: bold; font-size: 24px">
        LOCAT Admin Console
      </h1>
      <v-form>
        <v-text-field
          v-model="userId"
          label="Admin ID"
          outlined
          dense
          class="mb-4"
          prepend-inner-icon="mdi-account"
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="togglePasswordVisibility"
          class="mb-4"
        ></v-text-field>
        <v-alert type="error" v-if="errorMessage" dense text="">
          {{ errorMessage }}
        </v-alert>
        <v-btn class="mt-6" block elevation="1" rounded @click="login">
          로그인
        </v-btn>
      </v-form>
    </v-card>
    <!-- Password Reset View -->
    <v-card v-if="isPasswordExpired" class="pa-6" elevation="2">
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

    <!-- MFA View -->
    <v-card v-if="needMFA && !showVerification" class="pa-6" elevation="2">
      <h1 class="text-center mb-6" style="font-weight: bold; font-size: 24px">
        Multi-Factor Authentication
      </h1>
      <v-form>
        <v-text-field
          v-model="phoneNumber"
          :value="formattedPhoneNumber"
          label="휴대폰 번호"
          outlined
          dense
          class="mb-4"
          prepend-inner-icon="mdi-cellphone"
          @input="formatPhoneNumber"
          maxLength="13"
        ></v-text-field>
        <v-btn
          class="mb-4"
          block
          elevation="1"
          rounded
          :disabled="!isPhoneNumberValid"
          @click="sendVerificationCode"
        >
          {{ buttonLabel }}
        </v-btn>
        <v-alert type="error" v-if="mfaErrorMessage" dense text="">
          {{ mfaErrorMessage }}
        </v-alert>
      </v-form>
    </v-card>

    <v-card v-if="showVerification" class="pa-6" elevation="2">
      <h1 class="text-center mb-4" style="font-weight: 500; font-size: 24px">
        인증 코드 입력
      </h1>
      <div class="text-center mb-2">
        "{{ formattedPhoneNumber }}"로 인증 코드를 발송했습니다.
      </div>
      <v-form>
        <v-text-field
          v-model="verificationCode"
          label="인증번호 입력"
          maxLength="6"
          outlined
          dense
          class="mb-4"
          prepend-inner-icon="mdi-lock-check"
          append-inner
        >
          <template #append-inner>
            <span class="timer-text">{{ timerText }}</span>
          </template>
        </v-text-field>
        <v-alert type="error" v-if="mfaErrorMessage" dense text="">
          {{ mfaErrorMessage }}
        </v-alert>
        <v-btn class="mt-4" block elevation="1" rounded @click="verifyCode">
          인증
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { request } from "@/utils/request-client";
import { LoginResponse } from "@/types/login-response";

export default defineComponent({
  name: "AdminLoginView",
  setup() {
    const router = useRouter();

    onMounted(async () => {
      const fingerPrint = await FingerprintJS.load();
      deviceId.value = (await fingerPrint.get()).visitorId;
    });

    // UI State
    const showPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };
    const toggleNewPasswordVisibility = () => {
      showNewPassword.value = !showNewPassword.value;
    };
    const toggleConfirmPasswordVisibility = () => {
      showConfirmPassword.value = !showConfirmPassword.value;
    };

    // Login State
    const deviceId = ref("");
    const userId = ref("");
    const password = ref("");
    const isPasswordExpired = ref(false);
    const loginErrorMessage = ref("");
    const login = async () => {
      try {
        const response = await request<LoginResponse>("/v1/auth/admin/token", {
          method: "POST",
          body: JSON.stringify({
            deviceId: deviceId.value,
            userId: userId.value,
            password: password.value,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data) {
          localStorage.setItem("accessToken", response.data.token.accessToken);
          localStorage.setItem(
            "refreshToken",
            response.data.token.refreshToken
          );
          if (response.data.isPasswordExpired) {
            isPasswordExpired.value = true;
          } else {
            alert("로그인 성공!");
            router.push({ name: "Dashboard" });
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

    // Password Reset State
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
        body: JSON.stringify({
          userId: userId.value,
          newPassword: newPassword.value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.data) {
            alert("비밀번호가 성공적으로 재설정되었습니다.");
          }
        })
        .catch(() => {
          passwordResetErrorMessage.value = "비밀번호 재설정에 실패했습니다.";
        });
    };

    // MFA State
    const needMFA = ref(false);
    const showVerification = ref(false);
    const mfaErrorMessage = ref("");

    // SMS Verification State
    const phoneNumber = ref("");
    const formattedPhoneNumber = ref("");
    const isPhoneNumberValid = ref(false);
    const buttonLabel = ref("인증 코드 발송 요청");

    const formatPhoneNumber = () => {
      const digits = phoneNumber.value.replace(/\D/g, "").slice(0, 11);
      const length = digits.length;
      if (length < 4) {
        formattedPhoneNumber.value = digits;
      } else if (length < 8) {
        formattedPhoneNumber.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        formattedPhoneNumber.value = `${digits.slice(0, 3)}-${digits.slice(
          3,
          7
        )}-${digits.slice(7)}`;
      }
      phoneNumber.value = digits;
      isPhoneNumberValid.value = length === 11;
    };

    // Verification Code State
    const verificationCode = ref("");
    const sendVerificationCode = () => {
      showVerification.value = true;
      verifyCredentials();
    };

    // Timer State
    const timer = ref(300);
    const timerText = computed(() => {
      const minutes = Math.floor(timer.value / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (timer.value % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    });

    let timeInterval: number;

    const verifyCredentials = () => {
      timer.value = 300;
      timeInterval = setInterval(() => {
        timer.value--;
        if (timer.value === 0) {
          clearInterval(timeInterval);
        }
      }, 1000);
    };

    const verifyCode = () => {
      login();
    };

    return {
      login,
      userId,
      password,
      isPasswordExpired,
      errorMessage: loginErrorMessage,
      showPassword,
      togglePasswordVisibility,
      newPassword,
      confirmPassword,
      showNewPassword,
      showConfirmPassword,
      toggleNewPasswordVisibility,
      toggleConfirmPasswordVisibility,
      passwordResetErrorMessage,
      resetPassword,
      needMFA,
      showVerification,
      mfaErrorMessage,
      sendVerificationCode,
      verifyCredentials,
      verifyCode,
      phoneNumber,
      formattedPhoneNumber,
      isPhoneNumberValid,
      buttonLabel,
      formatPhoneNumber,
      verificationCode,
      timer,
      timerText,
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
