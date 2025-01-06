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

      <v-card-text v-else-if="itemDetail" class="pa-6">
        <v-row>
          <!-- 물건 이미지 -->
          <v-col cols="12" md="4" class="text-center">
            <v-img
              :src="itemDetail.imageUrl || '/placeholder-image.png'"
              aspect-ratio="1"
              contain
              class="rounded-lg elevation-2"
            ></v-img>
          </v-col>

          <!-- 물건 정보 -->
          <v-col cols="12" md="8">
            <v-card class="info-card" elevation="2">
              <v-card-title class="primary lighten-1 white--text py-4">
                <v-icon icon="mdi-information" class="mr-2" />
                물건 정보
              </v-card-title>
              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="6">
                    <div class="info-box">
                      <div class="info-label">물건명</div>
                      <div class="info-value">
                        {{ itemDetail.itemName || "-" }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="info-box">
                      <div class="info-label">등록자</div>
                      <div class="info-value">
                        {{ itemDetail.username || "-" }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="info-box">
                      <div class="info-label">분류</div>
                      <div class="info-value">
                        {{
                          itemDetail.itemType === "lost" ? "분실물" : "습득물"
                        }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="info-box">
                      <div class="info-label">등록일</div>
                      <div class="info-value">
                        {{ formatDate(itemDetail.createdAt) }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="info-box">
                      <div class="info-label">카테고리</div>
                      <div class="info-value">
                        {{ itemDetail.categoryPath || "-" }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="info-box">
                      <div class="info-label">색상</div>
                      <div class="info-value">
                        {{ itemDetail.colorNames?.join(", ") || "-" }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 위치 -->
        <v-row class="mt-6">
          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title class="info lighten-1 white--text py-4">
                <v-icon icon="mdi-map-marker" class="mr-2" />
                위치
              </v-card-title>
              <v-card-text class="pa-4">
                <p class="text-body-1">
                  {{ itemDetail.region1 || "-" }} >
                  {{ itemDetail.region2 || "-" }} >
                  {{ itemDetail.region3 || "-" }}
                </p>
                <div id="map" style="height: 400px"></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <div v-else class="text-center pa-6">물건 정보를 찾을 수 없습니다.</div>
    </v-card>
  </v-container>
</template>

<script lang="ts">
declare global {
  interface Window {
    kakao: any;
  }
}
import { defineComponent, onMounted, ref } from "vue";
import { request } from "@/utils/request-client";
import { BaseResponse } from "@/types/common/response";
import { ItemDetail } from "@/types/item/item-detail";

export default defineComponent({
  name: "ItemDetailView",
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const itemDetail = ref<ItemDetail | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    const fetchItemDetail = async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await request<BaseResponse<ItemDetail>>(
          `/v1/items/${props.id}`,
          {
            method: "GET",
          }
        );
        itemDetail.value = response.data;
        console.log(response.data);
      } catch (err) {
        error.value = "물건 정보를 불러오지 못했습니다.";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateArray: number[] | null): string => {
      if (!dateArray || dateArray.length < 3) return "-"; // 배열이 없거나 길이가 3보다 작으면 유효하지 않음

      const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;

      const date = new Date(year, month - 1, day, hour, minute, second);

      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    };

    const initMap = () => {
      console.log("initMap 함수 실행");
      console.log(
        "Kakao Maps script URL:",
        `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.VUE_APP_KAKAO_KEY}`
      );

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.VUE_APP_KAKAO_KEY}&autoload=false`;
      script.async = true;

      script.onload = () => {
        console.log("Kakao Maps 스크립트 로드 성공!");

        // Kakao Maps 초기화
        if (window.kakao) {
          console.log("Kakao Maps 초기화 시작");
          window.kakao.maps.load(() => {
            console.log("Kakao Maps 초기화 완료");

            if (
              itemDetail.value &&
              itemDetail.value.lat &&
              itemDetail.value.lng
            ) {
              const mapContainer = document.getElementById("map");
              if (!mapContainer) {
                console.error("Map container가 존재하지 않습니다.");
                return;
              }

              const mapOption = {
                center: new window.kakao.maps.LatLng(
                  itemDetail.value.lat,
                  itemDetail.value.lng
                ),
                level: 3,
              };
              const map = new window.kakao.maps.Map(mapContainer, mapOption);

              const markerPosition = new window.kakao.maps.LatLng(
                itemDetail.value.lat,
                itemDetail.value.lng
              );
              const marker = new window.kakao.maps.Marker({
                position: markerPosition,
              });
              marker.setMap(map);
            }
          });
        } else {
          console.error("Kakao Maps 객체가 생성되지 않았습니다.");
        }
      };

      script.onerror = (error) => {
        console.error("Kakao Maps 스크립트를 로드할 수 없습니다.", error);
      };

      document.head.appendChild(script);
    };

    onMounted(async () => {
      await fetchItemDetail();
      initMap();
    });

    return {
      itemDetail,
      loading,
      error,
      formatDate,
    };
  },
});
</script>

<style scoped>
.info-box {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 16px;
}

.info-label {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
}

.info-value {
  font-size: 1.1rem;
  color: #555;
}

#map {
  width: 100%;
  height: 400px;
  border-radius: 8px;
}
</style>
