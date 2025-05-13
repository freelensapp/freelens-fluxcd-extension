const path = require("path");

module.exports = [
  {
    entry: "./main.ts",
    context: __dirname,
    target: "electron-main",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    externals: [
      {
        "@freelensapp/extensions": "var global.LensExtensions",
        mobx: "var global.Mobx",
        react: "var global.React",
      },
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
      minimize: false,
    },
    output: {
      libraryTarget: "commonjs2",
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
    },
  },
  {
    entry: "./renderer.tsx",
    context: __dirname,
    target: "electron-renderer",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
        {
          test: /\.svg$/,
          use: "raw-loader",
        },
      ],
    },
    externals: [
      {
        "@freelensapp/extensions": "var global.LensExtensions",
        react: "var global.React",
        mobx: "var global.Mobx",
      },
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
      minimize: false,
    },
    output: {
      libraryTarget: "commonjs2",
      globalObject: "this",
      filename: "renderer.js",
      path: path.resolve(__dirname, "dist"),
    },
    node: {
      __dirname: false,
      __filename: false,
    },
  },
];
