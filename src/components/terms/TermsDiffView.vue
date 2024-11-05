<template>
  <v-card flat>
    <v-card-title class="text-subtitle-2">
      버전 변경사항 비교
      <v-spacer></v-spacer>
      <div class="text-caption">
        {{ formatDate(previousTerms.updatedAt) }} →
        {{ formatDate(currentTerms.updatedAt) }}
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
        <div v-for="(diff, index) in diffs" :key="index" class="diff-line">
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
              <v-icon size="small" color="error" class="mr-2">mdi-minus</v-icon>
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
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { diffLines } from "diff";
import { formatDate } from "@/utils/date-formatter";

export default defineComponent({
  name: "TermsDiffViewer",
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
    const diffs = computed(() => {
      return diffLines(props.previousTerms.content, props.currentTerms.content);
    });

    return {
      diffs,
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
</style>
