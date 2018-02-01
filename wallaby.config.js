
var wallabyWebpack = require('wallaby-webpack');

var webpackConfig = {
  resolve: {
      extensions: ['', '.ts', '.tsx', '.webpack.js', '.web.js', '.js'],
      alias: {
          'react-dnd/modules/backends/HTML5': 'react-dnd-html5-backend'
      }
  },
  // // Source maps support (or 'inline-source-map' also works)
  // devtool: 'source-map',
  
  module: {
        loaders: [{
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
        }]
    }
    
};



//var config = require('./webpack.config');

//var wallabyPostprocessor = wallabyWebpack(webpackConfig);


module.exports = function (wallaby) {  
  return {
    // set `load: false` to all source files and tests processed by webpack
    // (except external files),
    // as they should not be loaded in browser,
    // their wrapped versions will be loaded instead
    files: [      
      {pattern: 'src/**/*.ts*', load: false},
      {pattern:'__tests__/lib/*.ts', load:false}
    ],

    tests: [
     // {pattern: '__tests__/**/TriggerSaver-test.ts*', load: false}      
      '__tests__/**/*-test.ts'
    ],

    //postprocessor: wallabyPostprocessor,
    //compilers: {
    //  '**/*.js?(x)': wallaby.compilers.babel()
    //},

   env: {
      type: 'node'
    },

    testFramework: 'jasmine',    

    debug: true
  };
};