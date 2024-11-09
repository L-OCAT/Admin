<template>
  <v-card flat>
    <v-card-title class="text-subtitle-2">
      버전 변경사항 비교
      <v-spacer></v-spacer>
      <div class="text-caption">
        {{ formatDate(previousTerms.createdAt) }} →
        {{ formatDate(currentTerms.createdAt) }}
      </div>
    </v-card-title>

    <v-card-text>
      <div class="mb-4">
        <div class="d-flex align-center mb-2">
          <v-chip small label class="mr-2" color="success" text-color="white">
            추가됨
          </v-chip>
          <v-chip small label color="error" text-color="white"> 삭제됨 </v-chip>
        </div>
      </div>

      <v-skeleton-loader v-if="loading" type="article"></v-skeleton-loader>

      <div v-else class="diff-container">
        <!-- HTML 모드와 텍스트 모드 전환 -->
        <v-btn-toggle v-model="diffMode" mandatory class="mb-4">
          <v-btn value="text" small>텍스트 비교</v-btn>
          <v-btn value="html" small>HTML 비교</v-btn>
        </v-btn-toggle>

        <!-- 텍스트 모드 -->
        <template v-if="diffMode === 'text'">
          <div
            v-for="(diff, index) in textDiffs"
            :key="'text-' + index"
            class="diff-line"
          >
            <template v-if="diff.added">
              <div class="diff-content added">
                <v-icon size="small" color="success" class="mr-2"
                  >mdi-plus</v-icon
                >
                <span>{{ diff.value }}</span>
              </div>
            </template>
            <template v-else-if="diff.removed">
              <div class="diff-content removed">
                <v-icon size="small" color="error" class="mr-2"
                  >mdi-minus</v-icon
                >
                <span>{{ diff.value }}</span>
              </div>
            </template>
            <template v-else>
              <div class="diff-content unchanged">
                <span class="mr-8"></span>
                {{ diff.value }}
              </div>
            </template>
          </div>
        </template>

        <!-- HTML 모드 -->
        <template v-else>
          <div v-html="htmlDiff" class="html-diff-content"></div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { diffLines } from "diff";
import * as DiffMatchPatch from "diff-match-patch";
import { formatDate } from "@/utils/date-formatter";

export default defineComponent({
  name: "TermsDiffView",
  props: {
    previousTerms: {
      type: Object,
      required: true,
    },
    currentTerms: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const diffMode = ref("text");
    const dmp = new DiffMatchPatch.diff_match_patch();

    const textDiffs = computed(() => {
      return diffLines(props.previousTerms.content, props.currentTerms.content);
    });

    const htmlDiff = computed(() => {
      const diffs = dmp.diff_main(
        props.previousTerms.content,
        props.currentTerms.content
      );
      dmp.diff_cleanupSemantic(diffs);

      return diffs
        .map(([type, text]) => {
          const escapedText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

          switch (type) {
            case 1: // 추가됨
              return `<div class="diff-content added"><span class="diff-marker">+</span>${escapedText}</div>`;
            case -1: // 삭제됨
              return `<div class="diff-content removed"><span class="diff-marker">-</span>${escapedText}</div>`;
            default: // 변경없음
              return `<div class="diff-content unchanged"><span class="diff-marker"> </span>${escapedText}</div>`;
          }
        })
        .join("");
    });

    return {
      diffMode,
      textDiffs,
      htmlDiff,
      formatDate,
    };
  },
});
</script>

<style scoped>
.diff-container {
  font-family: "Consolas", "Monaco", monospace;
  white-space: pre-wrap;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
}

.diff-line {
  margin: 2px 0;
}

.diff-content {
  display: flex;
  align-items: flex-start;
  padding: 2px 8px;
  border-radius: 2px;
}

.diff-content.added {
  background-color: rgba(76, 175, 80, 0.1);
}

.diff-content.removed {
  background-color: rgba(244, 67, 54, 0.1);
}

.diff-content.unchanged {
  background-color: transparent;
}

/* HTML diff 관련 스타일 */
:deep(.diff-marker) {
  display: inline-block;
  width: 20px;
  color: #666;
  font-weight: bold;
}

.html-diff-content {
  white-space: pre-wrap;
}
</style>
