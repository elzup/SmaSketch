import 'core-js/fn/object/assign'
import React from 'react'
import { Router, Route, browserHistory } from 'react-router'
import ReactDOM from 'react-dom'
import MainComponent from 'components/main'
import SubComponent from 'components/sub'
import InvalidComponent from 'components/invalid'
import queryString from 'query-string'

const parsed = queryString.parse(location.search)
const isCorrectAccess = Boolean(parsed.ox) && Boolean(parsed.oy)

// Render the main component into the dom
ReactDOM.render(
	<Router history={browserHistory}>
		<Route path="/" component={MainComponent} />
		<Route
			path="sub"
			component={isCorrectAccess ? SubComponent : InvalidComponent}
		/>
		<Route path="*" component={InvalidComponent} />
	</Router>,
	document.getElementById('app'),
)
