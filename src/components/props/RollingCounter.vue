<template>
  <span class="animated-counter">{{ displayNumber }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, withDefaults, defineProps } from "vue";

interface Props {
  endValue: number;
  duration?: number;
  delay?: number;
  minDuration?: number;
  maxDuration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2000,
  delay: 0,
  minDuration: 1000,
  maxDuration: 5000,
});

const displayNumber = ref(0);

const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

const calculateDynamicDuration = (start: number, end: number): number => {
  const difference = Math.abs(end - start);

  const scaleFactor = Math.log10(difference + 1) / Math.log10(1000);
  const dynamicDuration =
    props.minDuration +
    (props.maxDuration - props.minDuration) * Math.min(scaleFactor, 1);

  return Math.min(
    Math.max(dynamicDuration, props.minDuration),
    props.maxDuration
  );
};

const animateValue = (start: number, end: number, duration: number) => {
  let startTimestamp: number | null = null;

  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    const easedProgress = easeOutQuart(progress);

    displayNumber.value = Math.floor(easedProgress * (end - start) + start);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

onMounted(() => {
  setTimeout(() => {
    const duration =
      props.duration === 2000
        ? calculateDynamicDuration(0, props.endValue)
        : props.duration;
    animateValue(0, props.endValue, duration);
  }, props.delay);
});

watch(
  () => props.endValue,
  (newValue) => {
    const duration =
      props.duration === 2000
        ? calculateDynamicDuration(displayNumber.value, newValue)
        : props.duration;
    animateValue(displayNumber.value, newValue, duration);
  }
);
</script>
