<template>
  <v-container fluid>
    <v-card class="pa-4" outlined>
      <v-card-title class="text-h5 font-weight-bold">게시글 관리</v-card-title>
      <v-row>
        <!-- 사진 및 기본 정보 -->
        <v-col cols="12" sm="4">
          <v-img
            :src="item.imageUrl || 'default-image.jpg'"
            alt="물건 이미지"
            width="100%"
            height="300px"
            contain
          ></v-img>
        </v-col>
        <v-col cols="12" sm="8">
          <v-row>
            <v-col cols="4">물건명</v-col>
            <v-col cols="8">{{ item.name || "%물건명%" }}</v-col>

            <v-col cols="4">분류</v-col>
            <v-col cols="8">{{ item.status || "분실물" }}</v-col>

            <v-col cols="4">카테고리</v-col>
            <v-col cols="8">{{ item.category || "%대분류% > %소분류%" }}</v-col>

            <v-col cols="4">색상</v-col>
            <v-col cols="8">{{ item.color || "%색상%" }}</v-col>

            <v-col cols="4">등록자</v-col>
            <v-col cols="8">{{ item.registrant || "%닉네임%" }}</v-col>

            <v-col cols="4">등록일</v-col>
            <v-col cols="8">{{ item.registrationDate || "yyyy.mm.dd" }}</v-col>

            <v-col cols="4">삭제일</v-col>
            <v-col cols="8">{{ item.deletionDate || "yyyy.mm.dd" }}</v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- 위치 정보 -->
      <v-row class="mt-4">
        <v-col cols="12" class="text-h6 font-weight-bold"> 위치 </v-col>
        <v-col cols="12">{{ item.location || "%위치정보%" }}</v-col>
        <v-col cols="12">
          <!-- 지도 이미지 or 실제 지도 연동 -->
          <v-img
            :src="mapImageUrl"
            alt="지도"
            width="100%"
            height="300px"
            contain
          ></v-img>
        </v-col>
      </v-row>

      <!-- 수정 및 삭제 버튼 -->
      <v-row class="mt-4 d-flex justify-center">
        <v-btn color="#ff5f2c" @click="editItem" dark>수정</v-btn>
        <v-btn color="#ff5f2c" @click="deleteItem" dark outlined>삭제</v-btn>
      </v-row>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "ItemDetailView",
  props: {
    item: {
      type: Object as PropType<{
        name: string;
        status: string;
        category: string;
        color: string;
        registrant: string;
        registrationDate: string;
        deletionDate: string;
        location: string;
        imageUrl: string;
      }>,
      required: true,
    },
  },
  computed: {
    mapImageUrl(): string {
      // 지도 이미지 URL 또는 실제 지도 연동 로직을 추가할 수 있습니다.
      return "path-to-map-image.jpg";
    },
  },
  methods: {
    editItem() {
      // 수정 기능 로직
      console.log("Edit item:", this.item);
    },
    deleteItem() {
      // 삭제 기능 로직
      console.log("Delete item:", this.item);
    },
  },
});
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
.v-btn {
  text-transform: none;
  font-weight: 600;
}
</style>
