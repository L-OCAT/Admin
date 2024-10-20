<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    fill-height
  >
    <v-card class="pa-6 text-center" elevation="2">
      <h1>요청한 페이지를 찾을 수 없습니다!</h1>
      <p>올바른 주소인지 확인해주세요.</p>
      <p class="mt-4 redirect-message">
        <strong>{{ countdown }}</strong
        >초 뒤에 이전 페이지로 돌아갑니다.
      </p>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "NotFoundView",
  setup() {
    const router = useRouter();
    const countdown = ref(3);

    onMounted(() => {
      const interval = setInterval(() => {
        countdown.value -= 1;
        if (countdown.value === 0) {
          clearInterval(interval);
          router.replace("/");
        }
      }, 1000);
    });

    return {
      countdown,
    };
  },
});
</script>

<style scoped>
.v-container {
  min-height: 100vh;
}

h1 {
  font-size: 24px;
  color: #333;
}

p {
  color: #666;
}

.redirect-message {
  font-size: 16px;
  color: #ff5f2c;
}
</style>
