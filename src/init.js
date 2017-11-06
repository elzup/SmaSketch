// @flow

import { injectGlobal } from 'styled-components'

injectGlobal`
html, body {
  height: 100%;
  min-height: 100%;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI',
  'Noto Sans Japanese', 'ヒラギノ角ゴ ProN W3', Meiryo, sans-serif;
  margin: 0;
	background: #a2c11c;
	color: #283739;
}

* {
	margin: 0px;
	padding: 0px;
}

`
