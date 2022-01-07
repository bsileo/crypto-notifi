module.exports = {
  transpileDependencies: ["vuex-module-decorators"],
  configureWebpack: {
    devtool: "source-map",
  },
  devServer: {
    host: "localhost",
  },
};
