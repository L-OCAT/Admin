<template>
  <v-container>
    <v-card v-if="isSuperAdmin">
      <v-card-title class="d-flex align-center pa-4">
        <span class="text-h4 font-weight-bold">서버 상태 대시보드</span>
        <v-chip
          v-if="health"
          :color="getServerStatusColor(health.status)"
          text-color="white"
          label
          class="ml-4"
        >
          전체 상태: {{ health.status }}
        </v-chip>
      </v-card-title>
      <v-card-text>
        <v-row v-if="health">
          <v-col cols="12" sm="6" md="4">
            <health-component-card name="Server" :component="serverHealth" />
          </v-col>
          <template v-if="health.components">
            <v-col v-if="health.components.db" cols="12" sm="6" md="4">
              <health-component-card
                name="Database"
                :component="health.components.db"
              />
            </v-col>
            <v-col v-if="health.components.redis" cols="12" sm="6" md="4">
              <health-component-card
                name="Redis"
                :component="health.components.redis"
              />
            </v-col>
          </template>
        </v-row>
        <v-row v-else>
          <v-col cols="12" class="text-center">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
            <div>서버 상태를 불러오는 중...</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card v-else class="text-center pa-6">
      <v-icon size="48" color="error" class="mb-4">mdi-alert-circle</v-icon>
      <div class="text-h5 mb-2">접근 권한 없음</div>
      <div class="text-body-1">서버 상태 열람 권한이 없습니다.</div>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { IHealth, IServerHealth } from "@/types/server/server-metric";
import { request } from "@/utils/request-client";
import HealthComponentCard from "./HealthComponentCard.vue";
import { getServerStatusColor } from "@/utils/color-utils";
import { useAuth } from "@/store/auth";

export default defineComponent({
  name: "ServerManageView",
  components: {
    HealthComponentCard,
  },
  setup() {
    const auth = useAuth();
    const isSuperAdmin = computed(() => auth.isSuperAdmin());
    const health = ref<IHealth | null>(null);

    const fetchHealthInfo = async () => {
      if (!isSuperAdmin.value) return;

      try {
        health.value = await request<IHealth>("/actuator/health");
      } catch (error) {
        console.error("서버 상태 정보를 불러오는데 실패했습니다:", error);
      }
    };

    const serverHealth = computed<IServerHealth>(() => ({
      status: health.value?.status || "UNKNOWN",
      details: {
        diskSpace: {
          total: 0,
          free: 0,
          threshold: 0,
          path: "",
          exists: false,
        },
      },
    }));

    onMounted(() => {
      if (isSuperAdmin.value) {
        fetchHealthInfo();
      }
    });

    return {
      health,
      getServerStatusColor,
      serverHealth,
      isSuperAdmin,
    };
  },
});
</script>

<style scoped>
.v-card {
  transition: all 0.3s;
}
.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
