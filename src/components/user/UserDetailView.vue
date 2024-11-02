<template>
  <v-container>
    <v-card class="detail-view">
      <div v-if="loading" class="text-center pa-6">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>

      <div v-else-if="error" class="text-center pa-6 error--text">
        {{ error }}
      </div>

      <v-card-text v-else-if="userDetail" class="pa-6">
        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="2" class="info-card mb-6">
              <v-card-title class="primary lighten-1 white--text py-4">
                <v-icon icon="mdi-account-circle" class="mr-2" />
                기본 정보
              </v-card-title>
              <v-card-text class="pa-4">
                <v-list>
                  <v-list-item class="mb-3">
                    <v-list-item-content>
                      <v-list-item-title
                        class="text-subtitle-1 font-weight-bold mb-1"
                        >닉네임</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-1">{{
                        userDetail.nickname
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item class="mb-3">
                    <v-list-item-content>
                      <v-list-item-title
                        class="text-subtitle-1 font-weight-bold mb-1"
                        >이메일</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-1">{{
                        userDetail.email
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item class="mb-3">
                    <v-list-item-content>
                      <v-list-item-title
                        class="text-subtitle-1 font-weight-bold mb-1"
                        >가입 방식</v-list-item-title
                      >
                      <v-list-item-subtitle>
                        <v-chip
                          small
                          :color="getOAuthTypeColor(userDetail.oAuthType)"
                          class="white--text"
                        >
                          {{ userDetail.oAuthType }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item class="mb-3">
                    <v-list-item-content>
                      <div class="d-flex align-center">
                        <div class="flex-grow-1">
                          <v-list-item-title
                            class="text-subtitle-1 font-weight-bold mb-1"
                            >권한</v-list-item-title
                          >
                          <v-list-item-subtitle>
                            <v-chip
                              small
                              :color="getUserTypeColor(userDetail.type)"
                              class="white--text"
                            >
                              {{ userDetail.type }}
                            </v-chip>
                          </v-list-item-subtitle>
                        </div>
                        <v-btn
                          v-if="currentUserAuth === 'SUPER_ADMIN'"
                          small
                          color="#ff5f2c"
                          class="ml-2"
                          @click="showUserTypeDialog = true"
                        >
                          권한 변경
                        </v-btn>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item class="mb-3">
                    <v-list-item-content>
                      <v-list-item-title
                        class="text-subtitle-1 font-weight-bold mb-1"
                        >상태</v-list-item-title
                      >
                      <v-list-item-subtitle>
                        <v-chip
                          small
                          :color="getStatusTypeColor(userDetail.statusType)"
                          class="white--text"
                        >
                          {{ userDetail.statusType }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title
                        class="text-subtitle-1 font-weight-bold mb-1"
                        >가입일</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-1">{{
                        formatDate(userDetail.createdAt)
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card elevation="2" class="info-card mb-6">
              <v-card-title class="success lighten-1 white--text py-4">
                <v-icon icon="mdi-chart-box" class="mr-2" />
                활동 정보
              </v-card-title>
              <v-card-text class="pa-4">
                <v-row class="mb-4">
                  <v-col cols="6">
                    <v-card class="text-center" outlined>
                      <v-card-text>
                        <div
                          class="text-h4 font-weight-bold primary--text mb-2"
                        >
                          {{
                            userDetail.activityDetails.totalRegisteredLostItems
                          }}
                        </div>
                        <div class="subtitle-1">등록한 분실물</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="text-center" outlined>
                      <v-card-text>
                        <div
                          class="text-h4 font-weight-bold success--text mb-2"
                        >
                          {{
                            userDetail.activityDetails.totalRegisteredFoundItems
                          }}
                        </div>
                        <div class="subtitle-1">등록한 습득물</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title class="info lighten-1 white--text py-4">
                <v-icon icon="mdi-file-document" class="mr-2" />
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
                      class="white--text"
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

      <div v-else class="text-center pa-6">사용자 정보를 찾을 수 없습니다.</div>

      <v-dialog v-model="showUserTypeDialog" max-width="400">
        <v-card>
          <v-card-title class="headline">권한 변경</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedUserType"
              :items="userTypes"
              label="변경할 권한"
              item-text="label"
              item-value="value"
              class="mt-4"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey darken-1"
              text=""
              @click="showUserTypeDialog = false"
              >취소</v-btn
            >
            <v-btn color="#ff5f2c" @click="updateUserType">변경</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
import {
  getOAuthTypeColor,
  getStatusTypeColor,
  getUserTypeColor,
} from "@/utils/color-utils";
import { useAuth } from "@/store/auth";

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
    const currentUserAuth = useAuth().getAuthority();
    const userDetail = ref<UserStatResponse | null>(null);
    const foundItemStat = ref<AdminUserFoundItemStatResponse | null>(null);
    const lostItemStat = ref<AdminUserLostItemStatResponse | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const showUserTypeDialog = ref(false);
    const selectedUserType = ref<string>("");

    const userTypes = [
      { value: "SUPER_ADMIN", title: "최고 관리자" },
      { value: "ADMIN", title: "관리자" },
      { value: "MANAGER", title: "매니저" },
      { value: "USER", title: "일반 사용자" },
    ];

    const agreementHeaders = [
      {
        title: "약관명",
        key: "termsName" as const,
        align: "start",
        sortable: false,
        width: "40%",
      },
      {
        title: "동의 여부",
        key: "isAgreed",
        align: "center",
        width: "30%",
      },
      {
        title: "동의 일시",
        key: "agreedAt",
        align: "center",
        sortable: false,
        width: "30%",
      },
    ];

    const updateUserType = async () => {
      console.log(`Update called`);
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
      currentUserAuth,
      showUserTypeDialog,
      selectedUserType,
      userTypes,
      updateUserType,
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

.v-list-item {
  padding: 12px 0;
}

.v-list-item-content {
  padding: 8px 0;
}

.v-card-title {
  font-size: 1.25rem;
  font-weight: 500;
}

.v-card.outlined {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.info-card {
  height: 100%;
}
</style>
