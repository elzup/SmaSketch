require('normalize.css/normalize.css')
require('styles/App.css')

import React from 'react'

class AppComponent extends React.Component {
	render() {
		return (
			<canvas>
			</canvas>
		)
	}
}

AppComponent.defaultProps = {}

export default AppComponent
