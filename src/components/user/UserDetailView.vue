<template>
  <v-container>
    <v-card class="detail-view">
      <v-card-title class="d-flex justify-space-between align-center pa-6">
        <span class="text-h4">사용자 상세 정보</span>
      </v-card-title>

      <v-card-text v-if="userDetail" class="pa-6">
        <v-row>
          <!-- 기본 정보 섹션 -->
          <v-col cols="12" md="6">
            <v-card elevation="2">
              <v-card-title class="primary lighten-1 white--text">
                <v-icon left color="white">mdi-account-circle</v-icon>
                기본 정보
              </v-card-title>
              <v-card-text class="pa-4">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold"
                      >닉네임</v-list-item-title
                    >
                    <v-list-item-subtitle>{{
                      userDetail.nickname
                    }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold"
                      >이메일</v-list-item-title
                    >
                    <v-list-item-subtitle>{{
                      userDetail.email
                    }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold"
                      >가입 방식</v-list-item-title
                    >
                    <v-list-item-subtitle>
                      <v-chip
                        small
                        :color="getOAuthTypeColor(userDetail.oAuthType)"
                      >
                        {{ userDetail.oAuthType }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold"
                      >권한</v-list-item-title
                    >
                    <v-list-item-subtitle>
                      <v-chip small :color="getUserTypeColor(userDetail.type)">
                        {{ userDetail.type }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold"
                      >상태</v-list-item-title
                    >
                    <v-list-item-subtitle>
                      <v-chip
                        small
                        :color="getStatusTypeColor(userDetail.statusType)"
                      >
                        {{ userDetail.statusType }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title class="font-weight-bold"
                      >가입일</v-list-item-title
                    >
                    <v-list-item-subtitle>{{
                      formatDate(userDetail.createdAt)
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card elevation="2" height="100%">
              <v-card-title class="success lighten-1 white--text">
                <v-icon left color="white">mdi-chart-box</v-icon>
                활동 정보
              </v-card-title>
              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="6">
                    <v-card class="text-center" outlined>
                      <v-card-text>
                        <div class="text-h4 font-weight-bold primary--text">
                          {{
                            userDetail.activityDetails.totalRegisteredLostItems
                          }}
                        </div>
                        <div class="subtitle-1">등록된 분실물</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="text-center" outlined>
                      <v-card-text>
                        <div class="text-h4 font-weight-bold success--text">
                          {{
                            userDetail.activityDetails.totalRegisteredFoundItems
                          }}
                        </div>
                        <div class="subtitle-1">등록된 습득물</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title class="info lighten-1 white--text">
                <v-icon left color="white">mdi-file-document</v-icon>
                약관 동의 내역
              </v-card-title>
              <v-card-text class="pa-4">
                <v-data-table
                  :headers="agreementHeaders"
                  :items="userDetail.agreementDetails"
                  no-data-text="약관 동의 정보를 찾을 수 없습니다."
                  hide-default-footer
                  disable-pagination
                  class="elevation-1"
                >
                  <template v-slot:[`item.isAgreed`]="{ item }">
                    <v-chip
                      small
                      :color="item.isAgreed ? 'success' : 'error'"
                      :text-color="'white'"
                    >
                      {{ item.isAgreed ? "동의" : "미동의" }}
                    </v-chip>
                  </template>
                  <template v-slot:[`item.agreedAt`]="{ item }">
                    {{ item.agreedAt ? formatDate(item.agreedAt) : "-" }}
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text v-else class="text-center pa-6">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from "vue";
import { formatDate } from "@/utils/date-formatter";
import {
  AdminUserFoundItemStatResponse,
  AdminUserLostItemStatResponse,
  UserStatResponse,
} from "@/types/user/user-statistic";
import { request } from "@/utils/request-client";
import { BaseResponse } from "@/types/common/response";
import { AxiosRequestConfig } from "axios";

export default defineComponent({
  name: "UserDetailView",
  props: {
    userId: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  emits: ["back"],
  setup(props, { emit }) {
    const userDetail = ref<UserStatResponse | null>(null);
    const foundItemStat = ref<AdminUserFoundItemStatResponse | null>(null);
    const lostItemStat = ref<AdminUserLostItemStatResponse | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    const agreementHeaders = [
      {
        title: "약관명",
        key: "termsName" as const,
        align: "start",
        sortable: false,
      },
      { title: "동의 여부", key: "isAgreed", align: "center" },
      { title: "동의 일시", key: "agreedAt", align: "center", sortable: false },
    ];

    const getOAuthTypeColor = (type: string) => {
      const colors: { [key: string]: string } = {
        GOOGLE: "red lighten-1",
        KAKAO: "yellow darken-2",
        NAVER: "green",
      };
      return colors[type] || "grey";
    };

    const getUserTypeColor = (type: string) => {
      const colors: { [key: string]: string } = {
        ADMIN: "deep-purple",
        USER: "blue",
      };
      return colors[type] || "grey";
    };

    const getStatusTypeColor = (status: string) => {
      const colors: { [key: string]: string } = {
        ACTIVE: "success",
        INACTIVE: "warning",
        BANNED: "error",
      };
      return colors[status] || "grey";
    };

    const fetchUserData = async () => {
      loading.value = true;
      error.value = null;

      try {
        const options: AxiosRequestConfig = {
          method: "GET",
        };

        const [userResponse, foundResponse, lostResponse] = await Promise.all([
          request<BaseResponse<UserStatResponse>>(
            `/v1/admin/statistics/users/${props.userId}`,
            options
          ),
          request<BaseResponse<AdminUserFoundItemStatResponse>>(
            `/v1/admin/statistics/users/${props.userId}/founds`,
            options
          ),
          request<BaseResponse<AdminUserLostItemStatResponse>>(
            `/v1/admin/statistics/users/${props.userId}/losts`,
            options
          ),
        ]);

        userDetail.value = userResponse.data;
        foundItemStat.value = foundResponse.data;
        lostItemStat.value = lostResponse.data;
      } catch (e: any) {
        error.value =
          e.response?.data?.message || "사용자 정보를 불러오는데 실패했습니다.";
        console.error("Error fetching user details:", e);
      } finally {
        loading.value = false;
      }
    };

    const backToList = () => {
      emit("back");
    };

    onMounted(() => {
      fetchUserData();
    });

    return {
      userDetail,
      foundItemStat,
      lostItemStat,
      agreementHeaders,
      loading,
      error,
      formatDate,
      getOAuthTypeColor,
      getUserTypeColor,
      getStatusTypeColor,
      backToList,
    };
  },
});
</script>

<style scoped>
.detail-view {
  border-radius: 8px;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
