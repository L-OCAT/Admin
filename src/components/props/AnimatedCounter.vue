<template>
  <span class="animated-counter">{{ displayNumber }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, withDefaults, defineProps } from "vue";

interface Props {
  endValue: number;
  duration?: number;
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2000,
  delay: 0,
});

const displayNumber = ref(0);

const animateValue = (start: number, end: number, duration: number) => {
  let startTimestamp: number | null = null;

  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    displayNumber.value = Math.floor(progress * (end - start) + start);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

onMounted(() => {
  setTimeout(() => {
    animateValue(0, props.endValue, props.duration);
  }, props.delay);
});

watch(
  () => props.endValue,
  (newValue) => {
    animateValue(displayNumber.value, newValue, props.duration);
  }
);
</script>
