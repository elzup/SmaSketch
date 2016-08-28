import React from 'react'
import io from 'socket.io-client'
import pos from 'dom.position'

require('normalize.css/normalize.css')
require('styles/App.css')


export default class SubComponent extends React.Component {
	render() {
		return (
			<div>
				<h1 className="title_con">Sma Sketch</h1>
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
			if (event.touches[0] && event.touches[0].target.tagName == 'button') {
				return
			}
			event.preventDefault()
		}

		['touchstart', 'touchmove', 'touchend','gesturestart', 'gesturechange', 'gestureend'].forEach(func => {
			document.addEventListener(func, stopDefault, false)
		})

		const socket = io.connect(window.location.hostname + ':8080')

		const canvas = document.getElementById('myCanvas')
		const c = canvas.getContext('2d')
		let drawing = false
		let oldPos

		canvas.width = window.innerWidth - pos(canvas).left - 10
		canvas.height = window.innerHeight - pos(canvas).top - 10

		c.strokeStyle = '#000000'
		c.lineWidth = 5
		c.lineJoin = 'round'
		c.lineCap = 'round'

		const getPosMouse = (event) => {
			const mouseX = event.clientX - pos(canvas).left
			const mouseY = event.clientY - pos(canvas).top
			return {x: mouseX, y: mouseY}
		}

		const getPosTouch = (event) => {
			const mouseX = event.touches[0].clientX - pos(canvas).left
			const mouseY = event.touches[0].clientY - pos(canvas).top
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
				const pos = getPos(event)
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

	}

}