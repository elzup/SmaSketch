import io from 'socket.io-client'
import pos from 'dom.position'

require('normalize.css/normalize.css')
require('styles/App.css')

import React from 'react'

export default class MainComponent extends React.Component {
	render() {
		return (
			<div>
				<h1 className="title">Sma Sketch</h1>
				<div className="main">
					<div className="canvas">
						<canvas id="myCanvas"/>
					</div>
				</div>
			</div>
		)
	}

	static defaultComponent = {}

	componentDidMount() {

		const stopDefault = (event) => {
			if (event.touches[0].target.tagName.toLowerCase() == 'li') {
				return
			}
			if (event.touches[0].target.tagName.toLowerCase() == 'input') {
				return
			}

			event.preventDefault()
		}

		document.addEventListener('touchstart', stopDefault, false)
		document.addEventListener('touchmove', stopDefault, false)
		document.addEventListener('touchend', stopDefault, false)
		document.addEventListener('gesturestart', stopDefault, false)
		document.addEventListener('gesturechange', stopDefault, false)
		document.addEventListener('gestureend', stopDefault, false)

		var socket = io.connect(window.location.hostname + ':8080')

		var canvas = document.getElementById('myCanvas')
		var c = canvas.getContext('2d')
		var drawing = false
		var oldPos

		var w = window.innerWidth
		var h = window.innerHeight
		canvas.width = w - 20
		canvas.height = h - 100

		c.strokeStyle = '#000000'
		c.lineWidth = 5
		c.lineJoin = 'round'
		c.lineCap = 'round'

		const getPosMouse = (event) => {
			var mouseX = event.clientX - pos(canvas).left
			var mouseY = event.clientY - pos(canvas).top
			return {x: mouseX, y: mouseY}
		}

		const getPosTouch = (event) => {
			var mouseX = event.touches[0].clientX - pos(canvas).left
			var mouseY = event.touches[0].clientY - pos(canvas).top
			return {x: mouseX, y: mouseY}
		}

		const touchStart = getPos => {
			return (event) => {
				console.log('mousedown')
				drawing = true
				oldPos = getPos(event)
			}
		}
		canvas.addEventListener('mousedown', touchStart(getPosMouse), false)
		canvas.addEventListener('touchstart', touchStart(getPosTouch), false)

		const touchEnd = () => {
			console.log('mouseup')
			drawing = false
		}
		canvas.addEventListener('mouseup', touchEnd, false)
		canvas.addEventListener('touchend', touchEnd, false)

		const touchMove = (getPos) => {
			return (event) => {
				var pos = getPos(event)
				console.log('mousemove : x=' + pos.x + ', y=' + pos.y + ', drawing=' + drawing)
				if (drawing) {
					c.beginPath()
					c.moveTo(oldPos.x, oldPos.y)
					c.lineTo(pos.x, pos.y)
					c.stroke()
					c.closePath()
					socket.emit('draw', {before: oldPos, after: pos})
					oldPos = pos
				}
			}
		}
		canvas.addEventListener('mousemove', touchMove(getPosMouse), false)
		canvas.addEventListener('touchmove', touchMove(getPosTouch), false)

		canvas.addEventListener('mouseout', () => {
			console.log('mouseout')
			drawing = false
		}, false)

		socket.on('draw', data => {
			console.log('on draw : ' + data)
			c.beginPath()
			c.moveTo(data.before.x, data.before.y)
			c.lineTo(data.after.x, data.after.y)
			c.stroke()
			c.closePath()
		})

		socket.on('color', data => {
			console.log('on color : ' + data)
			c.strokeStyle = data
		})

		socket.on('lineWidth', data => {
			console.log('on lineWidth : ' + data)
			c.lineWidth = data
		})
	}
}
