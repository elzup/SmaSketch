require('normalize.css/normalize.css')
require('styles/App.css')

import React from 'react'

export default class INvalidComponent extends React.Component {
	render() {
		return (
			<div>
				<h1 className="title">Sma Sketch Canvas</h1>
				<div className="mainText">
					Invalid Access
				</div>
			</div>
		)
	}

	static defaultComponent = {}
}
