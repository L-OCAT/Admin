import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { fileURLToPath, URL } from "node:url";
import packages from "./package.json";

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packages.version),
    "import.meta.env.VITE_APP_BUILD_DATE": JSON.stringify(
      new Date().toLocaleDateString("ko-KR")
    ),
  },
});
