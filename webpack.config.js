const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const outputDir = 'assets';

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, outputDir),
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, outputDir),
    compress: true,
    port: 9000,
    host: '0.0.0.0'
  },
  plugins: [
    new CopyPlugin([
      { from: './src/index.html', to: path.resolve(__dirname, outputDir) },
      { from: './src/assets/logo.glb', to: path.resolve(__dirname, outputDir) },
    ]),
  ],
};
