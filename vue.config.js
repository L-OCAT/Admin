const { defineConfig } = require("@vue/cli-service");
const packages = require("./package.json");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000,
  },
  chainWebpack: (config) => {
    config.plugin("define").tap((args) => {
      args[0]["process.env"].VUE_APP_APP_VERSION = JSON.stringify(
        packages.version
      );
      args[0]["process.env"].VUE_APP_APP_BUILD_DATE = JSON.stringify(
        new Date().toLocaleDateString("ko-KR")
      );
      return args;
    });
  },
  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },
});
