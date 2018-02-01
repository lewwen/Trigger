var webpack = require('webpack');
var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
var path = require('path');

module.exports = {
    entry: [
        'webpack-hot-middleware/client',
        'react-hot-loader/patch',
        'babel-polyfill',
        './src/app/index.tsx'
    ],

    output: {
        path: __dirname + "/public",
        filename: "bundle.js"
    },

    // Currently we need to add '.ts' to resolve.extensions array.
    resolve: {
        extensions: ['', '.ts', '.tsx', '.webpack.js', '.web.js', '.js'],
        alias: {
            'react-dnd/modules/backends/HTML5': 'react-dnd-html5-backend'
        }
    },

    // Source maps support (or 'inline-source-map' also works)
    devtool: 'source-map',

    // Add loader for .ts files.
    module: {
        loaders: [{
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
        }]
    },
    
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new ForkCheckerPlugin()
    ]
};