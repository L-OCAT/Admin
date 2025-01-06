<template>
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
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useAuth } from "@/store/auth";

export default defineComponent({
  name: "MfaView",
  setup() {
    const auth = useAuth();

    // SMS Send State
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

    // MFA State
    const needMFA = ref(auth.needMFA);
    const showVerification = ref(false);
    const mfaErrorMessage = ref("");

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
      // auth.requireMFA(false); If Success
    };

    return {
      needMFA,
      showVerification,
      mfaErrorMessage,
      sendVerificationCode,
      verifyCredentials,
      verifyCode,
      verificationCode,
      timer,
      timerText,
      phoneNumber,
      formattedPhoneNumber,
      isPhoneNumberValid,
      buttonLabel,
      formatPhoneNumber,
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
