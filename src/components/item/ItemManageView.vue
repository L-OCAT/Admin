<template>
  <v-container fluid>
    <h4 class="text-h4 font-weight-bold mb-4">아이템 관리</h4>
    <!-- 필터 옵션과 검색 버튼 -->
    <v-card class="mb-12 pa-2">
      <v-row class="mt-2 align-center" style="align-items: center">
        <v-col
          cols="1"
          class="d-flex align-center justify-end"
          style="align-self: center"
        >
          <span style="font-weight: 700; font-size: 18px">물건명</span>
        </v-col>
        <v-col cols="4" sm="4" md="4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            clearable
            density="compact"
            @keyup.enter="handleSearch"
          ></v-text-field>
        </v-col>
        <v-col cols="4" sm="4" md="4" class="d-flex align-center">
          <v-radio-group v-model="itemStatus" row inline>
            <v-radio label="전체" value="all"></v-radio>
            <v-radio label="분실물" value="lost"></v-radio>
            <v-radio label="습득물" value="found"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row class="mt-2 align-center">
        <v-col cols="1" class="d-flex align-center justify-end">
          <span style="font-weight: 700; font-size: 18px">카테고리</span>
        </v-col>
        <v-col cols="4" sm="4" md="2">
          <v-select
            v-model="mainCategory"
            :items="mainCategories"
            label="대분류"
            outlined
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="subCategory"
            :items="subCategories"
            label="소분류"
            outlined
          ></v-select>
        </v-col>
      </v-row>
      <v-row class="mt-1 align-center">
        <v-col cols="1" class="d-flex align-center justify-end">
          <span style="font-weight: 700; font-size: 18px">등록일</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            offset-y
            min-width="auto"
          >
            <template #activator="{ props }">
              <v-text-field
                v-model="dateRangeText"
                label="등록 기간 선택"
                prepend-inner-icon="mdi-calendar"
                readonly
                v-bind="props"
                outlined
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dateRange"
              range
              no-title
              color="#ff5f2c"
              @update:model-value="handleDateSelect"
              locale="ko-KR"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-row class="mt-1 align-center">
        <v-col cols="1" class="d-flex align-center justify-end">
          <span style="font-weight: 700; font-size: 18px">위치</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="city"
            :items="cities"
            label="시/도"
            outlined
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="district"
            :items="districts"
            label="구/군"
            outlined
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="d-flex align-center justify-end">
          <v-btn color="#ff5f2c" @click="handleSearch" dark>검색</v-btn>
        </v-col>
      </v-row>
    </v-card>
    <v-slide-x-transition>
      <div v-if="showList">
        <!-- 목록 테이블 -->
        <v-card outlined>
          <v-data-table
            :headers="headers"
            :items="items"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :items-per-page-options="[10, 20, 30, 50]"
            @update:page="onPageChange"
            @update:items-per-page="onItemsPerPageChange"
            items-per-page-text="페이지 당 아이템 수"
            no-data-text="분실물을 찾을 수 없습니다."
            loading-text="목록을 불러오는 중..."
            :loading="loading"
            class="elevation-1"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                small
                color="#ff5f2c"
                dark
                @click="showItemDetail(item.id)"
              >
                상세보기
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </div>
    </v-slide-x-transition>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { Item } from "@/types/item/item";
import { formatDate } from "@/utils/date-formatter";
import { PageResponse } from "@/types/common/response";
import { request } from "@/utils/request-client";

export default defineComponent({
  name: "ItemManageView",
  setup() {
    const searchQuery = ref("");
    const mainCategory = ref("");
    const subCategory = ref("");
    const dateRange = ref<string[]>([]);
    const dateMenu = ref(false);
    const itemStatus = ref("all");
    const city = ref("");
    const district = ref("");
    const loading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const items = ref<Item[]>([]);
    const totalItems = ref(0);
    const showList = ref(true);
    const selectedItemId = ref<number | null>(null);

    const mainCategories = ref(["카테고리1", "카테고리2", "카테고리3"]);
    const subCategories = ref(["소분류1", "소분류2", "소분류3"]);
    const cities = ref(["서울", "부산", "대구"]);
    const districts = ref(["강남구", "서초구", "동작구"]);

    const headers = [
      { text: "번호", align: "start", value: "id" },
      { text: "물건명", value: "name" },
      { text: "카테고리", value: "category" },
      { text: "등록일", value: "date" },
      { text: "위치", value: "location" },
      { text: "상태", value: "status" },
      { text: "상세", value: "actions", sortable: false },
    ];

    const fetchItems = async () => {
      loading.value = true;
      const params = {
        page: currentPage.value,
        size: itemsPerPage.value,
        searchQuery: searchQuery.value,
        mainCategory: mainCategory.value,
        subCategory: subCategory.value,
        itemStatus: itemStatus.value,
        city: city.value,
        district: district.value,
        startDate: dateRange.value[0],
        endDate: dateRange.value[1],
      };

      try {
        const response = await request<PageResponse<Item[]>>("/v1/items", {
          params,
        });
        items.value = response.data.content;
        totalItems.value = response.data.totalElements;
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => {
      currentPage.value = 1;
      fetchItems();
    };

    const dateRangeText = computed(() => {
      if (dateRange.value?.length) {
        return dateRange.value.length === 1
          ? formatDate(dateRange.value[0])
          : `${formatDate(dateRange.value[0])} ~ ${formatDate(
              dateRange.value[1]
            )}`;
      }
      return "";
    });

    const handleDateSelect = (dates: string[]) => {
      dateRange.value = dates;
      if (dates.length === 2) {
        dateMenu.value = false;
      }
    };

    const onPageChange = (page: number) => {
      currentPage.value = page;
      fetchItems();
    };

    const onItemsPerPageChange = (newItemsPerPage: number) => {
      itemsPerPage.value = newItemsPerPage;
      fetchItems();
    };

    const showItemDetail = (itemId: number) => {
      selectedItemId.value = itemId;
      showList.value = false;
    };

    return {
      searchQuery,
      mainCategory,
      subCategory,
      mainCategories,
      subCategories,
      dateRange,
      dateMenu,
      itemStatus,
      city,
      cities,
      district,
      districts,
      loading,
      currentPage,
      itemsPerPage,
      headers,
      items,
      handleSearch,
      dateRangeText,
      handleDateSelect,
      onPageChange,
      onItemsPerPageChange,
      showList,
      showItemDetail,
      selectedItemId,
    };
  },
});
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
  overflow: hidden;
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
/* 아이콘을 감싸는 v-field__prepend-inner에 스타일 추가 */
/*.small-input .v-field__prepend-inner {
  display: flex;
  align-items: center;
  height: 36px; !* 부모 요소 높이에 맞게 설정 *!
  padding: 0 4px; !* 필요에 따라 패딩 조절 *!
  justify-content: center; !* 아이콘을 수평 중앙에 오도록 설정 *!
}
.small-input .v-input__control {
  height: 30px !important; !* 텍스트 필드 전체 높이 *!
  max-height: 30px !important;
}
.small-input .v-input__slot {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}
.small-input input {
  font-size: 14px !important;
  line-height: 1 !important;
}
.label-text {
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center !important; !* 수직 중앙 정렬 강제 *!
  justify-content: center; !* 수평 중앙 정렬 *!
  height: 100%; !* 텍스트 필드의 높이에 맞춤 *!
  line-height: 1 !important; !* 기본 line-height 설정 *!
}*/
</style>
