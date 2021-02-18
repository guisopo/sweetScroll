const { merge } = require('webpack-merge');
const commonConfiguration = require('./webpack.common.js');
const path = require("path");

const configureDevServer = () => {
	return {
    inline: true,
    compress: true,
    hot: true,
    host: '0.0.0.0',
    port: 8080,
    contentBase: path.join(__dirname, './dist'),
    watchContentBase: true,
    open: true,
    https: false,
    useLocalIp: true,
    overlay: true,
    noInfo: true,
  };
};

module.exports = merge( commonConfiguration, {
  mode: 'development',
  devServer: configureDevServer(),
  devtool: 'source-map',
  module: {
    rules: [
      {
        test:/\.scss$/,
        use: [ "style-loader", "css-loader", "sass-loader" ]
      }
    ]
  }
});
