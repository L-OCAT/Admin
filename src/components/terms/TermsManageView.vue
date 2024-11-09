<template>
  <v-container fluid>
    <v-slide-x-transition>
      <div v-if="showList">
        <v-card class="mb-12">
          <v-card-title class="text-h4 font-weight-bold mb-6">
            약관 관리
          </v-card-title>
        </v-card>

        <v-data-table
          :headers="headers"
          :items="terms"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          no-data-text="검색 결과가 없습니다."
          loading-text="약관 정보를 가져오는 중..."
          items-per-page-text="페이지 당 아이템 수"
          :items-per-page-options="[20]"
          @update:page="onPageChange"
          @update:items-per-page="onItemsPerPageChange"
          class="elevation-1"
        >
          <template v-slot:[`item.createdAt`]="{ item }">
            {{ formatStringDate(item.createdAt) }}
          </template>
          <template v-slot:[`item.isRequired`]="{ item }">
            {{ item.isRequired ? "필수" : "선택" }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              small
              color="#FF5F2C"
              class="mr-2"
              dark
              @click="showTermDetail(item.type)"
            >
              내용보기
            </v-btn>
          </template>
        </v-data-table>
      </div>
    </v-slide-x-transition>

    <v-slide-x-reverse-transition>
      <div v-if="!showList">
        <v-card>
          <v-toolbar color="#FF5F2C" dark>
            <v-btn icon @click="backToList">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>
              {{ selectedTermType ? "약관 상세 정보" : "새 약관 등록" }}
            </v-toolbar-title>
          </v-toolbar>
          <term-detail-view
            :term-type="selectedTermType"
            @save-success="handleSaveSuccess"
            @back="backToList"
          ></term-detail-view>
        </v-card>
      </div>
    </v-slide-x-reverse-transition>

    <v-snackbar v-model="show" :color="color" :timeout="3000">
      {{ message }}
      <template v-slot:action="{ attrs }">
        <v-btn text="" v-bind="attrs" @click="show = false">닫기</v-btn>
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
import { formatDate, formatStringDate } from "@/utils/date-formatter";
import { useSnackbar } from "@/hook/snackbar";
import { TermsResponse } from "@/types/terms";
import { BaseResponse } from "@/types/common/response";
import { request } from "@/utils/request-client";

export default defineComponent({
  name: "TermsManageView",
  components: {
    TermDetailView: defineAsyncComponent(
      () => import("@/components/terms/TermsDetailView.vue")
    ),
  },
  setup() {
    const showList = ref(true);
    const selectedTermType = ref<string | null>(null);
    const terms = ref<TermsResponse[]>([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const dateMenu = ref(false);
    const dateRange = ref<Date[]>([]);
    const { show, message, color, showMessage } = useSnackbar();

    const searchFields = ref({
      title: "",
      type: null,
    });

    onMounted(() => {
      fetchTerms();
    });

    const termTypes = [
      { title: "만 14세 이상", key: "OVER_14_POLICY" },
      { title: "서비스 이용약관", key: "TERMS_OF_SERVICE" },
      { title: "개인정보 처리방침", key: "PRIVACY_POLICY" },
      { title: "위치기반 서비스 이용약관", key: "LOCATION_POLICY" },
      { title: "마케팅 정보 수신 동의", key: "MARKETING_POLICY" },
      {
        title: "카카오톡 마케팅 정보 수신 동의",
        key: "KAKAO_MARKETING_POLICY",
      },
    ];

    const headers = [
      { title: "번호", align: "start", key: "id" },
      { title: "약관 제목", key: "title" },
      { title: "버전", key: "version" },
      { title: "등록일", key: "createdAt" },
      { title: "필수여부", key: "isRequired" },
      { title: "관리", key: "actions", sortable: false },
    ];

    const dateRangeText = computed(() => {
      if (dateRange.value?.length === 2) {
        return `${formatDate(dateRange.value[0])} ~ ${formatDate(
          dateRange.value[1]
        )}`;
      }
      return "";
    });

    const fetchTerms = async () => {
      loading.value = true;
      try {
        terms.value = (
          await request<BaseResponse<TermsResponse[]>>("/v1/terms")
        ).data;
      } catch (e) {
        showMessage("약관 정보를 불러오지 못했어요.");
      } finally {
        loading.value = false;
      }
    };

    const showTermDetail = (termType: string) => {
      selectedTermType.value = termType;
      showList.value = false;
    };

    const showTermCreate = () => {
      selectedTermType.value = null;
      showList.value = false;
    };

    const handleSaveSuccess = () => {
      showMessage("약관이 성공적으로 저장되었습니다.", { color: "success" });
      fetchTerms();
    };

    return {
      showList,
      show,
      message,
      color,
      terms,
      headers,
      searchFields,
      termTypes,
      selectedTermType: selectedTermType,
      currentPage,
      itemsPerPage,
      dateMenu,
      dateRange,
      dateRangeText,
      loading,
      showTermDetail,
      showTermCreate,
      handleSaveSuccess,
      backToList: () => {
        showList.value = true;
        selectedTermType.value = null;
      },
      handleSearch: fetchTerms,
      formatStringDate,
      handleDateSelect: (dates: Date[]) => {
        dateRange.value = dates;
        if (dates.length === 2) dateMenu.value = false;
      },
      onPageChange: (page: number) => {
        currentPage.value = page;
        fetchTerms();
      },
      onItemsPerPageChange: (size: number) => {
        itemsPerPage.value = size;
        currentPage.value = 1;
        fetchTerms();
      },
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

.v-btn[color="#FF5F2C"]:hover {
  background-color: #ff4f1c !important;
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
