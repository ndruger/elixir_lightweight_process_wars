const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;

module.exports = {
  devtool: (isDevelopment) ? 'eval-cheap-module-source-map' : undefined,
  debug: isDevelopment,
  entry: {
    app: [
      './web/static/js/app.js',
      './web/static/css/app.scss',
    ],
  },
  output: {
    path: __dirname + '/priv/static/js',
    filename: 'app.js',
    publicPath: '/js/',
  },
  externals: {
    jquery: 'jQuery',
  },
  resolve: {
    root: __dirname + '/web/static/js',
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
      {test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'sass-loader']},
      {test: /\.png$/, loader: 'file-loader'},
      {test: /\.jpg$/, loader: 'file-loader'},
    ],
  },
  plugins: (function() {
    const plugins = [];
    plugins.push(new webpack.HotModuleReplacementPlugin());
    return plugins;
  })(),
};

