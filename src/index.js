// @flow
'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import queryString from 'query-string'

import MainComponent from './components/Main'
import SubComponent from './components/Sub'
import './init'

const MainRoot = props => {
	const params = queryString.parse(props.location.search)
	const isSub = 'sub' in params
	if (isSub) {
		return <SubComponent ox={ox} oy={oy} />
	} else {
		return <MainComponent />
	}
}

// Render the main component into the dom
ReactDOM.render(
	<Router>
		<div>
			<Route exact path="/" component={MainRoot} />
		</div>
	</Router>,
	document.getElementById('root'),
)
