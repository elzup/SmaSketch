'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

import MainComponent from './components/Main'
import SubComponent from './components/Sub'
import './init'

// import InvalidComponent from './components/invalid'
// import queryString from 'query-string'
// const parsed = queryString.parse(location.search)
// const isCorrectAccess = Boolean(parsed.ox) && Boolean(parsed.oy)

const MainRoot = props => {
	debugger
	return <div>root</div>
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
