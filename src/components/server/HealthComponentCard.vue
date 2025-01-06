<template>
  <v-card :color="getStatusColor(component.status)" dark height="100%">
    <v-card-title class="text-h6">
      {{ name }}
    </v-card-title>
    <v-card-text>
      <v-icon x-large class="mb-2">
        {{ getStatusIcon(component.status) }}
      </v-icon>
      <div class="text-h5 mb-3">{{ component.status }}</div>
      <div v-if="component.details" class="details-container">
        <template v-if="name === 'Database'">
          <v-chip
            class="mb-2"
            :color="getStatusColor(component.status)"
            outlined
          >
            {{ component.details.database || "알 수 없음" }}
          </v-chip>
          <div class="detail-item">
            <strong>DB 무결성:</strong>
            {{ component.details.validationQuery ? "정상" : "확인 필요" }}
          </div>
        </template>
        <template v-else-if="name === 'Redis'">
          <div class="detail-item">
            <strong>버전:</strong>
            {{ component.details.version || "알 수 없음" }}
          </div>
        </template>
        <template v-else-if="name === 'Server'"> </template>
        <template v-else>
          <div
            v-for="(value, key) in component.details"
            :key="key"
            class="detail-item"
          >
            <strong>{{ formatKey(key) }}:</strong> {{ formatValue(value) }}
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { IComponentHealth } from "@/types/server/server-metric";

export default defineComponent({
  name: "HealthComponentCard",
  props: {
    name: {
      type: String,
      required: true,
    },
    component: {
      type: Object as PropType<IComponentHealth>,
      required: true,
    },
  },
  setup() {
    const getStatusColor = (status: string): string => {
      switch (status) {
        case "UP":
          return "green";
        case "DOWN":
          return "red";
        case "OUT_OF_SERVICE":
          return "orange";
        case "UNKNOWN":
        default:
          return "grey";
      }
    };

    const getStatusIcon = (status: string): string => {
      switch (status) {
        case "UP":
          return "mdi-check-circle";
        case "DOWN":
          return "mdi-alert-circle";
        case "OUT_OF_SERVICE":
          return "mdi-minus-circle";
        case "UNKNOWN":
        default:
          return "mdi-help-circle";
      }
    };

    const formatKey = (key: string): string => {
      return key
        .split(/(?=[A-Z])/)
        .join(" ")
        .replace(/^\w/, (c) => c.toUpperCase());
    };

    const formatValue = (value: unknown): string => {
      if (typeof value === "boolean") {
        return value ? "예" : "아니오";
      }
      if (typeof value === "number") {
        return value.toLocaleString();
      }
      if (value === null || value === undefined) {
        return "알 수 없음";
      }
      return String(value);
    };

    return {
      getStatusColor,
      getStatusIcon,
      formatKey,
      formatValue,
    };
  },
});
</script>

<style scoped>
.details-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
