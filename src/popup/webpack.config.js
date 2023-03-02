const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin')
    , path = require('path')

module.exports = (env, options) => ({
  entry: [
    'babel-polyfill',
    './src/index.js',
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: `app.js?${(+new Date).toString(32).substr(-5)}`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src",
          globOptions: {
            ignore: ["**/*.js", "**/*.scss", "**/*.html"]
          }
        },
        {
          from: "src/contentScript.js",
          to: "contentScript.js"
        }
      ]
    })    
  ],
  devtool: 'cheap-module-source-map'
})