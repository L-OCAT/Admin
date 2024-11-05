<template>
  <v-container fluid>
    <v-slide-x-transition>
      <div v-if="showList">
        <v-card class="mb-12">
          <v-card-title class="text-h4 font-weight-bold mb-6">
            사용자 관리
          </v-card-title>
          <v-card-text>
            <v-row class="mb-0">
              <v-col cols="4" class="py-0">
                <v-text-field
                  v-model="searchFields.nickname"
                  label="닉네임으로 검색"
                  prepend-inner-icon="mdi-account"
                  clearable
                  @keyup.enter="handleSearch"
                  height="48"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="py-0">
                <v-text-field
                  v-model="searchFields.email"
                  label="이메일으로 검색"
                  prepend-inner-icon="mdi-email"
                  clearable
                  @keyup.enter="handleSearch"
                  height="48"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4" class="py-0 d-flex align-center">
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
                      height="48"
                    ></v-text-field>
                  </template>
                  <v-card>
                    <v-card-text>
                      <v-row>
                        <v-col cols="8">
                          <v-date-picker
                            v-model="dateRange"
                            range
                            no-title
                            multiple
                            color="#ff5f2c"
                            @update:model-value="handleDateSelect"
                            locale="ko-KR"
                            class="elevation-0"
                          >
                          </v-date-picker>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-menu>
              </v-col>
              <v-col
                cols="6"
                class="py-0 d-flex align-center"
                style="padding-bottom: 16px !important"
              >
                <v-btn
                  variant="outlined"
                  class="mx-2"
                  @click="setDatePreset(7)"
                  height="48"
                  >1주일</v-btn
                >
                <v-btn
                  variant="outlined"
                  class="mx-2"
                  @click="setDatePreset(30)"
                  height="48"
                  >1개월</v-btn
                >
                <v-btn
                  variant="outlined"
                  class="mx-2"
                  @click="setDatePreset(90)"
                  height="48"
                  >3개월</v-btn
                >
              </v-col>
              <v-col
                cols="2"
                class="d-flex justify-end align-center py-0"
                style="padding-bottom: 16px !important"
              >
                <v-btn
                  color="#ff5f2c"
                  @click="handleSearch"
                  dark
                  height="48"
                  min-width="80"
                >
                  검색
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-data-table
          :headers="headers"
          :items="users"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :items-per-page-options="[10, 20, 30, 50]"
          @update:page="onPageChange"
          @update:items-per-page="onItemsPerPageChange"
          items-per-page-text="페이지 당 아이템 수"
          no-data-text="검색 결과가 없습니다."
          loading-text="사용자 정보를 가져오는 중..."
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:[`item.type`]="{ item }">
            <v-chip :color="getUserTypeColor(item.type)" small dark>
              {{ item.type }}
            </v-chip>
          </template>
          <template v-slot:[`item.statusType`]="{ item }">
            <v-chip :color="getStatusTypeColor(item.statusType)" small dark>
              {{ item.statusType }}
            </v-chip>
          </template>
          <template v-slot:[`item.oAuthType`]="{ item }">
            <v-chip :color="getOAuthTypeColor(item.oAuthType)" small dark>
              {{ item.oAuthType }}
            </v-chip>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">
            {{ formatStringDate(item.createdAt) }}
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            {{ formatStringDate(item.updatedAt) }}
          </template>
          <template v-slot:[`item.deletedAt`]="{ item }">
            {{ item.deletedAt ? formatStringDate(item.deletedAt) : "-" }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn small color="#ff5f2c" dark @click="showUserDetail(item.id)">
              상세보기
            </v-btn>
          </template>
        </v-data-table>
      </div>
    </v-slide-x-transition>

    <v-slide-x-reverse-transition>
      <div v-if="!showList">
        <v-card>
          <v-toolbar color="#ff5f2c" dark>
            <v-btn icon @click="backToList">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>사용자 상세 정보</v-toolbar-title>
          </v-toolbar>
          <user-detail-view
            :user-id="selectedUserId"
            @back="backToList"
          ></user-detail-view>
        </v-card>
      </div>
    </v-slide-x-reverse-transition>

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

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  defineAsyncComponent,
} from "vue";
import { EndUser } from "@/types/user/user";
import { formatDate, formatStringDate } from "@/utils/date-formatter";
import { PageResponse } from "@/types/common/response";
import { request } from "@/utils/request-client";
import { AxiosRequestConfig } from "axios";
import {
  getOAuthTypeColor,
  getStatusTypeColor,
  getUserTypeColor,
} from "@/utils/color-utils";
import { useSnackbar } from "@/hook/snackbar";

export default defineComponent({
  name: "UserManageView",
  methods: { formatStringDate },
  components: {
    UserDetailView: defineAsyncComponent(
      () => import("@/components/user/UserDetailView.vue")
    ),
  },
  setup() {
    const showList = ref(true);
    const users = ref<EndUser[]>([]);
    const selectedUserId = ref<number | null>(null);
    const searchFields = ref({
      nickname: "",
      email: "",
    });
    const dateRange = ref<Date[]>([]);
    const dateMenu = ref(false);
    const loading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const totalItems = ref(0);
    const {
      show,
      message,
      color,
      timeout,
      position,
      showMessage,
      hideMessage,
    } = useSnackbar();

    onMounted(() => {
      fetchUsers();
    });

    const headers = [
      { title: "번호", align: "start" as const, sortable: true, key: "id" },
      { title: "닉네임", key: "nickname" },
      { title: "이메일", key: "email" },
      { title: "권한", key: "type" },
      { title: "상태", key: "statusType" },
      { title: "가입 방식", key: "oAuthType" },
      { title: "가입일", key: "createdAt" },
      { title: "최종 수정일", key: "updatedAt" },
      { title: "탈퇴일", key: "deletedAt" },
      { title: "관리", key: "actions", sortable: false },
    ];

    const fetchUsers = async (options?: AxiosRequestConfig) => {
      loading.value = true;
      const params = {
        page: currentPage.value,
        size: itemsPerPage.value,
        nickname: searchFields.value.nickname,
        email: searchFields.value.email,
        startDate: dateRange.value[0]
          ? dateRange.value[0].toISOString().split("T")[0]
          : undefined,
        endDate: dateRange.value[1]
          ? dateRange.value[1].toISOString().split("T")[0]
          : undefined,
        ...options?.params,
      };

      try {
        const response = await request<PageResponse<EndUser[]>>("/v1/users", {
          ...options,
          params,
        });
        users.value = response.data.content;
        totalItems.value = response.data.totalElements;
      } catch (e: any) {
        showMessage("사용자 정보를 불러오지 못했어요.");
      } finally {
        loading.value = false;
      }
    };

    const showUserDetail = (userId: number) => {
      selectedUserId.value = userId;
      showList.value = false;
    };

    const backToList = () => {
      showList.value = true;
      selectedUserId.value = null;
    };

    const onPageChange = (page: number) => {
      currentPage.value = page;
      fetchUsers();
    };

    const onItemsPerPageChange = (newItemsPerPage: number) => {
      itemsPerPage.value = newItemsPerPage;
      currentPage.value = 1;
      fetchUsers();
    };

    const handleSearch = () => {
      currentPage.value = 1;
      fetchUsers();
    };

    const dateRangeText = computed(() => {
      if (dateRange.value?.length > 0) {
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

    const handleDateSelect = (dates: Date[]) => {
      dateRange.value = dates;
      if (dates.length === 2) {
        dateMenu.value = false;
      }
    };

    const setDatePreset = (days: number) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      dateRange.value = [startDate, endDate];
    };

    return {
      showList,
      show,
      message,
      color,
      timeout,
      position,
      hideMessage,
      showMessage,
      searchFields,
      selectedUserId,
      currentPage,
      itemsPerPage,
      totalItems,
      dateMenu,
      dateRange,
      dateRangeText,
      loading,
      headers,
      users,
      handleSearch,
      handleDateSelect,
      setDatePreset,
      showUserDetail,
      backToList,
      onPageChange,
      onItemsPerPageChange,
      formatDate,
      getUserTypeColor,
      getStatusTypeColor,
      getOAuthTypeColor,
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

.v-slide-x-transition-enter-active,
.v-slide-x-transition-leave-active,
.v-slide-x-reverse-transition-enter-active,
.v-slide-x-reverse-transition-leave-active {
  transition: transform 0.3s ease-out;
}

.v-slide-x-transition-enter-from,
.v-slide-x-reverse-transition-leave-to {
  transform: translateX(-100%);
}

.v-slide-x-transition-leave-to,
.v-slide-x-reverse-transition-enter-from {
  transform: translateX(100%);
}
</style>
