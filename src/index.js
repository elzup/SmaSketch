import 'core-js/fn/object/assign'
import React from 'react'
import {Router, Route, browserHistory} from 'react-router'
import ReactDOM from 'react-dom'
import MainComponent from 'components/Main'
import SubComponent from 'components/Sub'
import InvalidComponent from 'components/Invalid'
import queryString from 'query-string'

const parsed = queryString.parse(location.search)
const isCorrectAccess = !!parsed.ox && !!parsed.oy
console.dir(parsed)
console.dir(isCorrectAccess)

// Render the main component into the dom
ReactDOM.render((
	<Router history={browserHistory}>
		<Route path="/" component={MainComponent}/>
		<Route path="sub" component={ isCorrectAccess ? SubComponent : InvalidComponent }/>
		<Route path="*" component={InvalidComponent}/>
	</Router>
), document.getElementById('app'))
