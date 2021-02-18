const { merge } = require('webpack-merge');
const commonConfiguration = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = merge(
  commonConfiguration,
  {
    mode: 'production',
    optimization: {
      minimizer: [
        new OptimizeCssAssetsPlugin(),
      ]
    },
    module: {
      rules: [
        // CSS
        {
          test:/\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    },
    plugins:
    [
      new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
      new CleanWebpackPlugin(),
      new ImageMinimizerPlugin({
        minimizerOptions: {
          // Lossless optimization with custom option
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['jpegtran', { progressive: true }],
            ['optipng', { optimizationLevel: 5 }],
            [
              'svgo',
              {
                plugins: [
                  {
                    removeViewBox: false,
                  },
                ],
              },
            ],
          ],
        },
      }),
    ],
  }
);