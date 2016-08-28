import 'core-js/fn/object/assign'
import React from 'react'
import {Router, Route, browserHistory} from 'react-router'
import ReactDOM from 'react-dom'
import MainComponent from 'components/Main'
import SubComponent from 'components/Sub'

// Render the main component into the dom
ReactDOM.render((
	<Router history={browserHistory}>
		<Route path="/" component={MainComponent}/>
		<Route path="sub" component={(SubComponent)}/>
	</Router>
), document.getElementById('app'))
