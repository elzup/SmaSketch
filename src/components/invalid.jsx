import React from 'react'

require('normalize.css/normalize.css')
require('styles/App.css')

export default class INvalidComponent extends React.Component {
	render() {
		return (
			<body>
			<h1 className="title">Sma Sketch Canvas</h1>
			<div className="mainText">
				Invalid Access
			</div>
			</body>
		)
	}

	static defaultComponent = {}
}
