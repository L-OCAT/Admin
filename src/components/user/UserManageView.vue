<template>
  <v-container>
    <v-card class="mb-6">
      <v-card-title class="text-h5 font-weight-bold">
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
                  label="기간 선택"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateRange"
                range
                no-title
                scrollable
                color="#ff5f2c"
                @update:model-value="handleDateSelect"
                locale="ko-KR"
              >
                <v-spacer></v-spacer>
                <v-btn text="" color="#ff5f2c" @click="dateMenu = false"
                  >취소</v-btn
                >
                <v-btn text="" color="#ff5f2c" @click="confirmDateRange"
                  >확인</v-btn
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

interface User {
  id: number;
  nickname: string;
  email: string;
  oAuthType: string;
  createdAt: string;
  status: string;
}

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
      { title: "상태", key: "status" },
      { title: "액션", key: "actions", sortable: false },
    ];

    const users = ref<User[]>([
      {
        id: 1,
        nickname: "유저1",
        email: "user1@example.com",
        oAuthType: "KAKAO",
        createdAt: "2024-09-29",
        status: "활성",
      },
      {
        id: 2,
        nickname: "유저2",
        email: "user2@example.com",
        oAuthType: "APPLE",
        createdAt: "2024-09-30",
        status: "활성",
      },
      // ... more user data
    ]);

    const dateRangeText = computed(() => {
      if (dateRange.value && dateRange.value.length === 2) {
        return dateRange.value.join(" ~ ");
      }
      return "";
    });

    const handleSearch = () => {
      // Implement search logic
    };

    const handleDateSelect = (dates: string[]) => {
      dateRange.value = dates;
    };

    const confirmDateRange = () => {
      dateMenu.value = false;
      // Implement date range confirmation logic
    };

    const fetchUsers = () => {
      loading.value = true;
      // Simulate API call
      setTimeout(() => {
        loading.value = false;
      }, 1000);
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
      confirmDateRange,
      fetchUsers,
    };
  },
});
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
  text-align: center;
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
