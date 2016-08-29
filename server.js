/* eslint no-console:0 */

'use strict'
require('core-js/fn/object/assign')
const open = require('open')
const WebpackDevServer = require('webpack-dev-server')
const webpack = require('webpack')
const config = require('./webpack.config')

require('core-js/fn/object/assign')

new WebpackDevServer(webpack(config), config.devServer)
	.listen(config.port, err => {
		if (err) {
			console.log(err)
		}
		console.log('Listening at localhost:' + config.port)
		console.log('Opening your system browser...')
		open('http://localhost:' + config.port + '/webpack-dev-server/')
	})
