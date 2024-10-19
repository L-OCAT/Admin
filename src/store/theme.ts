import { defineStore } from "pinia";
import { useTheme } from "vuetify";
import { ref } from "vue";

const APP_THEME_KEY = "app_theme_dark_mode";

export const useAppTheme = defineStore("theme", () => {
  const isDarkMode = ref(false);
  const vuetifyTheme = useTheme();

  const init = () => {
    load();
    apply();
  };

  const load = () => {
    const darkMode = localStorage.getItem(APP_THEME_KEY);
    isDarkMode.value = darkMode === "true";
  };

  const save = () => {
    localStorage.setItem(APP_THEME_KEY, isDarkMode.value.toString());
  };

  const apply = () => {
    vuetifyTheme.global.name.value = isDarkMode.value ? "dark" : "light";
  };

  const toggle = () => {
    isDarkMode.value = !isDarkMode.value;
    save();
    apply();
  };

  return {
    isDarkMode,
    init: init,
    toggle: toggle,
  };
});
