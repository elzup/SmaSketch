'use strict'

import test from 'ava'
import config from '../../webpack.config'

test('should load app config file depending on current --env', t => {
	t.is(config.port, 8000)
})
