const path = require('path')
const WebpackHtmlPlugin  = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: {
    main: './src/index.js',
    vueDemo: './src/vueDemo.js',
    vendor: './notes/vue.js'
  },
  mode: 'development',
  stats: 'normal',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  devtool: 'inline-source-map',
  plugins: [
    new WebpackHtmlPlugin({
      title: '简单Demo',
      template: './public/index/index.html',
      filename: 'index.html',
      chunks: ['index']
    }), 
    new WebpackHtmlPlugin({
      title: 'VueDemo',
      template: './public/vueDemo/index.html',
      filename: 'vueDemo.html',
      chunks: ['vueDemo', 'vendor']
    }),
    new webpack.optimize.SplitChunksPlugin({
      name: 'vendor',
      filename: 'vendor.js'
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    mainFiles: ["index", "vueDemo"],
  },
  devServer: {
    hot: true,
    open: true,
    historyApiFallback: true,
    host: 'localhost',
    port: 8080,
    static: './dist',
    client: {
      logging: 'error'
    }
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: ['babel-loader', 'force-strict-loader']
      }
    ]
  }
}