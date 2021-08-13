const path = require('path');

module.exports = {
  entry: './src/bookie.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bookie.js',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  watch: true
};