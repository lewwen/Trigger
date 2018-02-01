var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill', './src/app/index.tsx'],
  output: {
    filename: '../app_control/maint/Triggers.js'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    alias: {
      'react-dnd/modules/backends/HTML5': 'react-dnd-html5-backend'
    }
  },
  module: {
    loaders: [
        {
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader'
        }
    ]
  }
}