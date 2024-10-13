<template>
  <v-container fluid>
    <v-row>
      <v-col cols="2" class="pa-0">
        <v-navigation-drawer app permanent>
          <v-list-item>
            <v-list-item-avatar>
              <v-img src="@/assets/logo.svg" alt="Logo"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>LOCAT</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list dense>
            <v-list-item link>
              <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
              <v-list-item-content>홈</v-list-item-content>
            </v-list-item>
            <v-list-item link>
              <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
              <v-list-item-content>유저 관리</v-list-item-content>
            </v-list-item>
            <v-list-item link>
              <v-list-item-icon><v-icon>mdi-post</v-icon></v-list-item-icon>
              <v-list-item-content>게시글 관리</v-list-item-content>
            </v-list-item>
            <v-list-item link>
              <v-list-item-icon><v-icon>mdi-settings</v-icon></v-list-item-icon>
              <v-list-item-content>설정</v-list-item-content>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
      </v-col>

      <v-col>
        <v-row class="mt-4">
          <v-col>
            <v-card class="pa-4" outlined>
              <v-row justify="space-between">
                <div>총 유저</div>
                <div>n 명</div>
              </v-row>
            </v-card>
          </v-col>
          <!-- 총 분석물, 총 승률 등의 카드 추가 -->
        </v-row>

        <v-row class="mt-4">
          <!-- 차트 구현 예시 -->
          <v-col cols="4">
            <v-card outlined>
              <v-card-title>등록 현황</v-card-title>
              <v-card-text>
                <!-- 차트 라이브러리를 이용해 차트 추가 -->
              </v-card-text>
            </v-card>
          </v-col>
          <v-col>
            <!-- 다른 차트 및 그래프 구현 -->
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  // 차트 데이터나 기타 추가적인 로직
});
</script>

<style scoped>
.v-navigation-drawer {
  background-color: #f5f5f5;
}
</style>
