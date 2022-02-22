module.exports = {
  transpileDependencies: ["vuex-module-decorators"],
  configureWebpack: {
    devtool: "source-map",
  },
  devServer: {
    host: "localhost",
  },
  pages: {
    index: {
      // entry for the page
      entry: "src/main.ts",
      // the source template
      template: "public/index.html",
      // output as dist/index.html
      filename: "index.html",
    },
    widgets: {
      entry: "src/widgets/main.ts",
      template: "public/widgets.html",
      filename: "widgets.html",
    },
  },
};
