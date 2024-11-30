<template>
  <v-container fluid>
    <h4 class="text-h4 font-weight-bold mb-4">아이템 관리</h4>
    <v-slide-x-transition>
      <div v-if="showList">
        <v-card class="mb-10">
          <v-card-text>
            <v-row class="mb-0">
              <v-col cols="6" class="d-flex align-center">
                <v-text-field
                  v-model="searchFields.name"
                  label="물건명 검색"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  @keyup.enter="handleSearch"
                  height="48"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="d-flex align-center">
                <v-radio-group v-model="itemStatus" row inline>
                  <v-radio label="전체" value="all"></v-radio>
                  <v-radio label="분실물" value="lost"></v-radio>
                  <v-radio label="습득물" value="found"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row class="mt-0 mb-0">
              <v-col cols="3" class="py-0 d-flex align-center">
                <v-select
                  v-model="mainCategory"
                  :items="mainCategories"
                  item-value="id"
                  item-title="name"
                  label="카테고리 대분류"
                  outlined
                ></v-select>
              </v-col>
              <v-col cols="3" class="py-0 d-flex align-center">
                <v-select
                  v-model="subCategory"
                  :items="filteredSubCategories"
                  item-value="id"
                  item-title="name"
                  label="카테고리 소분류"
                  outlined
                  :disabled="!mainCategory"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="mt-0 mb-0 align-center">
              <v-col cols="3">
                <v-menu
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  offset-y
                  min-width="290px"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-model="dateRangeText"
                      label="등록 기간 선택"
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
                <v-btn variant="outlined" class="mx-2" @click="setDatePreset(7)"
                  >1주일</v-btn
                >
                <v-btn
                  variant="outlined"
                  class="mx-2"
                  @click="setDatePreset(30)"
                  >1개월</v-btn
                >
                <v-btn
                  variant="outlined"
                  class="mx-2"
                  @click="setDatePreset(90)"
                  >3개월</v-btn
                >
              </v-col>
            </v-row>
            <v-row class="mt-0 mb-0 align-center">
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
                  :disabled="!city"
                ></v-select>
              </v-col>
              <v-col>
                <v-select
                  v-model="town"
                  :items="towns"
                  label="읍/면/동"
                  outlined
                  :disabled="!district"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="mt-0 mb-0 align-center justify-center">
              <v-btn color="#ff5f2c" @click="handleSearch" dark>검색</v-btn>
            </v-row>
          </v-card-text>
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
      </div>
    </v-slide-x-transition>
  </v-container>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  Ref,
  onMounted,
  toRaw,
} from "vue";
import { Item } from "@/types/item/item";
import { BaseResponse, PageResponse } from "@/types/common/response";
import { request } from "@/utils/request-client";
import { Category } from "@/types/item/category";

export default defineComponent({
  name: "ItemManageView",
  setup() {
    const searchFields = ref({
      name: "",
    });
    const itemStatus = ref("all");
    const mainCategory = ref("");
    const subCategory = ref("");
    const dateRange = ref<Date[]>([]);
    const dateMenu = ref(false);
    const city = ref("");
    const district = ref("");
    const town = ref("");
    const loading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const items = ref<Item[]>([]);
    const totalItems = ref(0);
    const showList = ref(true);
    const selectedItemId = ref<number | null>(null);

    const mainCategories = ref<Category[]>([]);
    const subCategories = ref<Category[]>([]);
    const filteredSubCategories = ref<Category[]>([]);
    // const cities = ref(["서울", "부산", "대구"]);
    // const districts = ref(["강남구", "서초구", "동작구"]);
    const fixedLocationData = ref({
      cities: [
        {
          name: "서울특별시",
          districts: [
            {
              name: "중구",
              towns: ["동자동", "도동1가"],
            },
            {
              name: "종로구",
              towns: ["청운동", "사직동"],
            },
          ],
        },
        {
          name: "부산광역시",
          districts: [{ name: "해운대구", towns: ["좌동", "중동"] }],
        },
      ],
    });

    const cities = ref(fixedLocationData.value.cities.map((city) => city.name));
    const districts = ref<string[]>([]);
    const towns = ref<string[]>([]);

    const headers = [
      { text: "번호", align: "start", value: "id" },
      { text: "물건명", value: "name" },
      { text: "카테고리", value: "category" },
      { text: "등록일", value: "date" },
      { text: "위치", value: "location" },
      { text: "상태", value: "status" },
      { text: "상세", value: "actions", sortable: false },
    ];

    const fetchCategories = async () => {
      try {
        const response = await request<BaseResponse<Category[]>>(
          "/v1/categories",
          {
            method: "GET",
          }
        );
        const categories = response.data;
        mainCategories.value = categories.filter(
          (category) =>
            category.parentId === null || category.parentId === undefined
        );
        subCategories.value = categories.filter(
          (category) =>
            category.parentId !== null && category.parentId !== undefined
        );
      } catch (error) {
        console.error("Fail to fetch categories.", error);
      }
    };

    watch(mainCategory, (newVal) => {
      if (newVal) {
        filteredSubCategories.value = subCategories.value.filter(
          (category) => category.parentId === (newVal ? Number(newVal) : null)
        );
      } else {
        filteredSubCategories.value = [];
      }
      subCategory.value = "";
    });

    watch(city, (newCity) => {
      const selectedCity = fixedLocationData.value.cities.find(
        (c) => c.name === newCity
      );
      districts.value = selectedCity
        ? selectedCity.districts.map((d) => d.name)
        : [];
      district.value = "";
      towns.value = [];
    });

    watch(district, (newDistrict) => {
      const selectedCity = fixedLocationData.value.cities.find(
        (c) => c.name === city.value
      );
      const selectedDistrict = selectedCity?.districts.find(
        (d) => d.name === newDistrict
      );
      towns.value = selectedDistrict ? selectedDistrict.towns : [];
      town.value = "";
    });

    const fetchItems = async () => {
      loading.value = true;
      const params = {
        page: currentPage.value,
        size: itemsPerPage.value,
        name: searchFields.value.name,
        mainCategory: mainCategory.value,
        subCategory: subCategory.value,
        itemStatus: itemStatus.value,
        city: city.value,
        district: district.value,
        startDate: dateRange.value[0]
          ? formatDate(dateRange.value[0])
          : undefined,
        endDate: dateRange.value[1]
          ? formatDate(dateRange.value[1])
          : undefined,
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
      if (dates.length > 2) {
        dateRange.value = dates.slice(1, 3); // 마지막에 선택한 두 개만 유지
      } else {
        dateRange.value = dates;
      }

      // 두 날짜가 모두 선택되면 메뉴를 닫음
      if (dateRange.value.length === 2) {
        dateMenu.value = false;
      }
    };

    const setDatePreset = (days: number) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      dateRange.value = [startDate, endDate];
    };

    const formatDate = (date: Date | null) => {
      return date
        ? new Date(date).toISOString().slice(0, 10).replace(/-/g, ".")
        : "";
    };

    const handleSearch = () => {
      currentPage.value = 1;
      fetchItems();
    };

    onMounted(() => {
      fetchCategories();
      fetchItems();
    });

    const onPageChange = (page: number) => {
      currentPage.value = page;
      // fetchCategories();
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
      searchFields,
      mainCategory,
      subCategory,
      mainCategories,
      subCategories,
      filteredSubCategories,
      dateRange,
      dateMenu,
      itemStatus,
      city,
      cities,
      district,
      districts,
      town,
      towns,
      loading,
      currentPage,
      itemsPerPage,
      headers,
      items,
      handleSearch,
      dateRangeText,
      onPageChange,
      onItemsPerPageChange,
      showList,
      showItemDetail,
      selectedItemId,
      setDatePreset,
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
