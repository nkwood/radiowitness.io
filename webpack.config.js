var webpack           = require('webpack');
var path              = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var BUILD_DIR   = path.resolve(__dirname, '');
var APP_DIR     = path.resolve(__dirname, 'js');
var STYLES_DIR  = path.resolve(__dirname, 'css');

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
});

function getEntrySources(sources) {
    if (process.env.NODE_ENV === 'dev') {
        sources.push('webpack-dev-server/client?http://localhost:8080');
        sources.push('webpack/hot/only-dev-server');
    }
    return sources;
}

var config = {
  entry: getEntrySources([
    'webpack-dev-server/client?http://localhost:8080',
    APP_DIR    + '/main.js',
    STYLES_DIR + '/bundle.less'
  ]),
  output: {
    publicPath : 'http://localhost:8080/',
    path       : BUILD_DIR,
    filename   : 'bundle.js'
  },
  module: {
    loaders: [
      {
        test    : /\.js?/,
        include : APP_DIR,
        loaders : ['react-hot', 'babel']
      },
      {
        test    : /\.less$/,
        include : STYLES_DIR,
        loader  : ExtractTextPlugin.extract('css!less') 
      },
      {
        test    : /\.css$/,
        include : STYLES_DIR,
        loaders : ['style!css']
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("bundle.css"),
    definePlugin
  ],
  devServer: {
    hot: true
  },
  devtool: 'eval'
};

module.exports = config;
