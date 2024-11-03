<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold"
            ><v-icon class="mr-2">mdi-account-multiple</v-icon>등록된 사용자
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center">
              <span class="text-h4 font-weight-bold" style="color: #ff5f2c">
                <AnimatedCounter
                  :end-value="stats.totalUsers"
                  :duration="1000"
                />
              </span>
              <span class="text-subtitle-1 ml-1">&nbsp;&nbsp;명</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold"
            ><v-icon class="mr-2">mdi-magnify-close</v-icon>등록된 분실물
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center">
              <span class="text-h4 font-weight-bold" style="color: #ff5f2c"
                ><AnimatedCounter
                  :end-value="stats.totalLostItems"
                  :duration="1000"
              /></span>
              <span class="text-subtitle-1 ml-1">&nbsp;&nbsp;개</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold"
            ><v-icon class="mr-2">mdi-magnify-plus</v-icon>등록된 습득물
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center">
              <span class="text-h4 font-weight-bold" style="color: #ff5f2c"
                ><AnimatedCounter
                  :end-value="stats.totalFoundItems"
                  :duration="1000"
              /></span>
              <span class="text-subtitle-1 ml-1">&nbsp;&nbsp;개</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold"
            ><v-icon class="mr-2">mdi-chart-donut</v-icon>분실/습득물 등록
            비율</v-card-title
          >
          <v-card-text>
            <div class="chart-wrapper">
              <Doughnut
                v-if="registrationChartData"
                :data="registrationChartData"
                :options="registrationChartOptions"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold"
            ><v-icon class="mr-2">mdi-chart-line</v-icon>월별 등록 현황
            추이</v-card-title
          >
          <v-card-text>
            <div class="chart-wrapper">
              <Line
                v-if="monthlyChartData"
                :data="monthlyChartData"
                :options="monthlyChartOptions"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold"
            ><v-icon class="mr-2">mdi-chart-bar</v-icon>카테고리별 등록
            분포</v-card-title
          >
          <v-card-text>
            <div class="chart-wrapper">
              <div class="chart-wrapper">
                <Bar
                  v-if="categoryChartData"
                  :data="categoryChartData"
                  :options="categoryChartOptions"
                />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="show"
      :timeout="timeout"
      :color="color"
      :position="position"
    >
      {{ message }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text="" v-bind="attrs" @click="hideMessage">
          닫기
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ScriptableContext,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "vue-chartjs";
import { request } from "@/utils/request-client";
import {
  ItemStatByCateogory,
  Dashboardstat,
  MonthlyItemStat,
  ItemRegistrationStat,
} from "@/types/dashboard/dashboard-stat";
import { BaseResponse } from "@/types/common/response";
import { useSnackbar } from "@/hook/snackbar";
import AnimatedCounter from "@/components/props/AnimatedCounter.vue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

let fetchInterval: number;
onMounted(() => {
  fetchAllData();
  fetchInterval = setInterval(fetchAllData, 60000); // 1분마다 데이터 갱신
});

onUnmounted(() => {
  clearInterval(fetchInterval);
});

const { show, message, color, timeout, position, showMessage, hideMessage } =
  useSnackbar();

// 상태 관리
const stats = ref<Dashboardstat>({
  totalUsers: 0,
  totalLostItems: 0,
  totalFoundItems: 0,
});

const registrationData = ref<ItemRegistrationStat>({
  lost: 0,
  found: 0,
});

const monthlyData = ref<MonthlyItemStat>({
  monthLabels: [],
  lostItemCount: [],
  foundItemCount: [],
});
const categoryData = ref<ItemStatByCateogory>({
  categoryLabels: [],
  lostItemCount: [],
  foundItemCount: [],
});

// 차트 주, 보조 색상 정의
const chartColors = {
  primary: "#FF5F2C",
  secondary: "#FFD5C8",
};

// 등록 현황(도넛 차트)
const registrationChartData = computed(() => ({
  labels: ["분실물", "습득물"],
  datasets: [
    {
      data: [registrationData.value.lost, registrationData.value.found],
      backgroundColor: [chartColors.primary, chartColors.secondary],
    },
  ],
}));

const registrationChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
    },
  },
};

// 월별 등록 현황(라인 차트)
const monthlyChartData = computed(() => ({
  labels: monthlyData.value.monthLabels,
  datasets: [
    {
      label: "분실물",
      data: monthlyData.value.lostItemCount,
      borderColor: chartColors.primary,
      backgroundColor: chartColors.primary,
      fill: true,
    },
    {
      label: "습득물",
      data: monthlyData.value.foundItemCount,
      borderColor: chartColors.secondary,
      backgroundColor: chartColors.secondary,
      fill: true,
    },
  ],
}));

const monthlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: (value: number) => Math.floor(value),
      },
    },
    x: {
      grid: {
        display: true,
        drawBorder: false,
      },
    },
  },
  elements: {
    line: {
      tension: 0.3,
    },
    point: {
      radius: (context: ScriptableContext<"line">) => {
        const value = context.raw as number;
        return value === 0 ? 0 : 3;
      },
    },
  },
};

// 카테고리별 등록 현황(Bar 차트)
const categoryChartData = computed(() => ({
  labels: categoryData.value.categoryLabels,
  datasets: [
    {
      label: "분실물",
      data: categoryData.value.lostItemCount,
      backgroundColor: chartColors.primary,
    },
    {
      label: "습득물",
      data: categoryData.value.foundItemCount,
      backgroundColor: chartColors.secondary,
    },
  ],
}));

const categoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: (value: number) => Math.floor(value),
      },
      grid: {
        display: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

// API Fetch
const fetchSummary = async () => {
  try {
    const data = (
      await request<BaseResponse<Dashboardstat>>(
        "/v1/admin/statistics/dashboard/summary"
      )
    ).data;
    stats.value = data;
    registrationData.value = {
      lost: data.totalLostItems,
      found: data.totalFoundItems,
    };
  } catch (error) {
    showMessage("통계 정보를 불러오지 못했어요.");
  }
};

const fetchMonthlyItemStat = async () => {
  try {
    monthlyData.value = (
      await request<BaseResponse<MonthlyItemStat>>(
        "/v1/admin/statistics/dashboard/items/monthly"
      )
    ).data;
  } catch (error) {
    showMessage("월별 통계 정보를 불러오지 못했어요.");
  }
};

const fetchItemByCategoryStat = async () => {
  try {
    categoryData.value = (
      await request<BaseResponse<ItemStatByCateogory>>(
        "/v1/admin/statistics/dashboard/items/by-categories"
      )
    ).data;
  } catch (error) {
    showMessage("카테고리별 통계 정보를 불러오지 못했어요.");
  }
};

const fetchAllData = async () => {
  await Promise.all([
    fetchSummary(),
    fetchMonthlyItemStat(),
    fetchItemByCategoryStat(),
  ]);
};
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-card-title {
  font-weight: bold;
}

.chart-wrapper {
  height: 300px; /* 두 차트의 높이를 동일하게 설정 */
  position: relative;
  width: 100%;
  padding: 16px 0;
}
</style>
