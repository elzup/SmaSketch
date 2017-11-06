// @flow

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import queryString from 'query-string'
import { config } from './config'

import MainComponent from './components/Main'
import SubComponent from './components/Sub'
import './init'

const MainRoot = props => {
	// HACKME: GitHub pages don't allow subpath
	//  can't       /SmaSketch/sub
	//  alternative /SmaSketch?sub
	const params = queryString.parse(props.location.search)
	const isSub = 'sub' in params
	const room = params.room || 'main'
	if (isSub) {
		const { ox, oy } = params
		return <SubComponent ox={ox} oy={oy} room={room} />
	} else {
		return <MainComponent room={room} />
	}
}

const { basename } = config
// Render the main component into the dom
ReactDOM.render(
	<Router basename={basename}>
		<div>
			<Route exact path="/" component={MainRoot} />
		</div>
	</Router>,
	document.getElementById('root'),
)
