const path = require('path');

module.exports = {
  entry: './src/bookie.ts',
  mode: 'development',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
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
    path: path.resolve(__dirname, 'dist')
  }
};