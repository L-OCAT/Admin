<template>
  <v-container fluid>
    <!-- List View -->
    <v-slide-x-transition>
      <div v-if="showList">
        <v-card class="mb-12">
          <v-card-title class="text-h4 font-weight-bold">
            게시글 관리
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="물건명"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  @keyup.enter="handleSearch"
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
                      label="등록 기간 선택"
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
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col
                cols="12"
                sm="6"
                md="4"
                class="d-flex justify-end align-center"
              >
                <v-btn color="#ff5f2c" @click="handleSearch" dark>검색</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

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
          <!--          <template v-slot:[`item.date`]="{ item }">-->
          <!--            {{ formatDate(item.date) }}-->
          <!--          </template>-->
          <!--          <template v-slot:[`item.actions`]="{ item }">-->
          <!--            <v-btn small color="#ff5f2c" dark @click="showItemDetail(item.id)">-->
          <!--              상세보기-->
          <!--            </v-btn>-->
          <!--          </template>-->
        </v-data-table>
      </div>
    </v-slide-x-transition>

    <!-- Detail View -->
    <!--    <v-slide-x-reverse-transition>-->
    <!--      <div v-if="!showList">-->
    <!--        <v-card>-->
    <!--          <v-toolbar color="#ff5f2c" dark>-->
    <!--            <v-btn icon @click="backToList">-->
    <!--              <v-icon>mdi-arrow-left</v-icon>-->
    <!--            </v-btn>-->
    <!--            <v-toolbar-title>아이템 상세 정보</v-toolbar-title>-->
    <!--          </v-toolbar>-->
    <!--          <item-detail-view-->
    <!--            :item-id="selectedItemId"-->
    <!--            @back="backToList"-->
    <!--          ></item-detail-view>-->
    <!--        </v-card>-->
    <!--      </div>-->
    <!--    </v-slide-x-reverse-transition>-->
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { Item } from "@/types/item/item";
import { formatDate } from "@/utils/date-formatter";
import { PageResponse } from "@/types/common/response";
import { request } from "@/utils/request-client";
import { AxiosRequestConfig } from "axios";

export default defineComponent({
  name: "ItemManageView",
  // components: {
  //   ItemDetailView: () => import("@/components/item/ItemDetailView.vue"),
  // },
  setup() {
    const showList = ref(true);
    const selectedItemId = ref<number | null>(null);
    const searchQuery = ref("");
    const dateRange = ref<string[]>([]);
    const dateMenu = ref(false);
    const loading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const totalItems = ref(0);

    const headers = [
      { title: "번호", align: "start", key: "id" },
      { title: "물건명", key: "name" },
      { title: "카테고리", key: "category" },
      { title: "위치", key: "location" },
      { title: "등록일", key: "date" },
      { title: "상태", key: "status" },
      { title: "관리", key: "actions", sortable: false },
    ];

    const items = ref<Item[]>([]);

    onMounted(() => {
      fetchItems();
    });

    const fetchItems = async (options?: AxiosRequestConfig) => {
      loading.value = true;
      const params = {
        page: currentPage.value,
        size: itemsPerPage.value,
        search: searchQuery.value,
        startDate: dateRange.value[0],
        endDate: dateRange.value[1],
        ...options?.params,
      };

      try {
        const response = await request<PageResponse<Item[]>>("/v1/items", {
          ...options,
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

    // const showItemDetail = (itemId: number) => {
    //   selectedItemId.value = itemId;
    //   showList.value = false;
    // };

    const backToList = () => {
      showList.value = true;
      selectedItemId.value = null;
    };

    const onPageChange = (page: number) => {
      currentPage.value = page;
      fetchItems();
    };

    const onItemsPerPageChange = (newItemsPerPage: number) => {
      itemsPerPage.value = newItemsPerPage;
      fetchItems();
    };

    const handleSearch = () => {
      fetchItems();
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

    const handleDateSelect = (dates: string[]) => {
      dateRange.value = dates;
      if (dates.length === 2) {
        dateMenu.value = false;
      }
    };

    return {
      showList,
      selectedItemId,
      searchQuery,
      dateRange,
      dateMenu,
      dateRangeText,
      loading,
      headers,
      items,
      currentPage,
      itemsPerPage,
      totalItems,
      handleSearch,
      fetchItems,
      // showItemDetail,
      backToList,
      onPageChange,
      onItemsPerPageChange,
      handleDateSelect,
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
</style>
