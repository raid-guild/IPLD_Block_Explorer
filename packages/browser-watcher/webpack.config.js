const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  target: "web",
  entry: "./src/index.ts",
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "browser-watcher.js",
    library: "BrowserWatcher",
    libraryTarget: "umd",
    globalObject: "this",
    umdNamedDefine: true,
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin([{ from: "node_modules/abi-decoder/dist/abi-decoder.js", to: "static/js/" }]),
    new webpack.ProvidePlugin([
      // This wasm file will be fetched dynamically when we initialize sql.js
      // It is important that we do not change its name, and that it is in the same folder as the js
      { from: "node_modules/sql.js/dist/sql-wasm.wasm", to: "static/js/" },
    ]),
  ],

  resolve: {
    mainFields: ["browser", "main"],
    aliasFields: ["browser"],
    extensions: [".webpack.js", ".web.js", ".wasm", ".mjs", ".ts", ".js"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      fs: false,
      assert: false,
    },
  },

  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: require.resolve("./src/lib.ts"),
        use: [
          {
            loader: "expose-loader",
            options: {
              exposes: "ContractWatcher",
            },
          },
        ],
        exclude: [path.resolve(__dirname, "node_modules")],
      },
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader",
        exclude: [path.resolve(__dirname, "node_modules")],
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
};
