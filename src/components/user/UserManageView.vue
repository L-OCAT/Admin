<template>
  <v-container>
    <v-card class="mb-12">
      <v-card-title class="text-h4 font-weight-bold">
        사용자 관리
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="searchQuery"
              label="검색"
              prepend-inner-icon="mdi-magnify"
              clearable
              @input="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="dateRangeText"
                  label="검색 기간 선택"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateRange"
                range
                no-title
                multiple
                color="#ff5f2c"
                @update:model-value="handleDateSelect"
                locale="ko-KR"
              >
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
            class="d-flex justify-end align-center"
          >
            <v-btn color="#ff5f2c" @click="fetchUsers" dark>검색</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="users"
      :items-per-page="10"
      items-per-page-text="페이지 당 아이템 수"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn small color="#ff5f2c" dark :to="`/users/${item.id}`">
          상세보기
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { EndUser } from "@/types/user/user";

export default defineComponent({
  name: "UserManageView",
  setup() {
    const searchQuery = ref("");
    const dateRange = ref<string[]>([]);
    const dateMenu = ref(false);
    const loading = ref(false);

    const headers = [
      { title: "번호", align: "start" as const, sortable: true, key: "id" },
      { title: "닉네임", key: "nickname" },
      { title: "이메일", key: "email" },
      { title: "가입방식", key: "oAuthType" },
      { title: "가입일", key: "createdAt" },
      { title: "마지막 수정일", key: "updatedAt" },
      { title: "상태", key: "status" },
      { title: "액션", key: "actions", sortable: false },
    ];

    const users = ref<EndUser[]>([
      {
        id: 1,
        nickname: "유저1",
        email: "user1@example.com",
        oAuthType: "KAKAO",
        createdAt: "2024-09-21",
        updatedAt: "2024-09-29",
        status: "활성",
      },
      {
        id: 2,
        nickname: "유저2",
        email: "user2@example.com",
        oAuthType: "APPLE",
        createdAt: "2024-09-25",
        updatedAt: "2024-09-30",
        status: "활성",
      },
      // ... more user data
    ]);

    const fetchUsers = () => {
      loading.value = true;
      // Simulate API call
      console.log(`Date Picked: ${dateRange.value}`);
      setTimeout(() => {
        loading.value = false;
      }, 1000);
    };

    const handleSearch = () => {
      // Implement search logic
      console.log(`Date Picked: ${dateRange.value}`);
    };

    const dateRangeText = computed(() => {
      if (dateRange.value && dateRange.value.length > 0) {
        if (dateRange.value.length === 1) {
          return formatDate(dateRange.value[0]);
        } else if (dateRange.value.length === 2) {
          return `${formatDate(dateRange.value[0])} ~ ${formatDate(
            dateRange.value[1]
          )}`;
        }
      }
      return "";
    });

    const handleDateSelect = (dates: string[]) => {
      dateRange.value = dates;
      if (dates.length === 2) {
        dateMenu.value = false; // 시작-종료 날짜를 모두 골랐다면, 달력을 닫음
      }
    };

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
      const weekday = weekdays[date.getDay()];

      return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
    };

    return {
      searchQuery,
      dateMenu,
      dateRange,
      dateRangeText,
      loading,
      headers,
      users,
      handleSearch,
      handleDateSelect,
      fetchUsers,
    };
  },
});
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table :deep(.v-data-table__wrapper) {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.v-data-table :deep(th) {
  font-weight: bold;
  text-transform: uppercase;
  background-color: #f5f5f5;
}

.v-card {
  border-radius: 12px;
}

.v-btn {
  text-transform: none;
  font-weight: 600;
}
</style>
