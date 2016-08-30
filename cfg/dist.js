'use strict'

let path = require('path')
let webpack = require('webpack')

let baseConfig = require('./base')
let defaultSettings = require('./defaults')

// Add needed plugins here
let BowerWebpackPlugin = require('bower-webpack-plugin')

let config = Object.assign({}, baseConfig, {
	entry: path.join(__dirname, '../src/index'),
	cache: false,
	devtool: 'sourcemap',
	plugins: [
		new webpack.optimize.DedupePlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new BowerWebpackPlugin({
			searchResolveModulesDirectories: false
		}),
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.NoErrorsPlugin()
	],
	module: defaultSettings.getDefaultModules()
})

// Add needed loaders to the defaults here
config.module.loaders.push({
	test: /\.(js|jsx)$/,
	loader: 'babel',
	include: [].concat(
		config.additionalPaths,
		[path.join(__dirname, '/../src')]
	)
})

config.module.loaders.push({
	test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
	loader: 'url-loader?mimetype=application/font-woff'
})

config.module.loaders.push({
	test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
	loader: 'file-loader'
})

module.exports = config
