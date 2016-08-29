import React from 'react'
import io from 'socket.io-client'
import pos from 'dom.position'
import queryString from 'query-string'
import {Icon} from 'react-fa'

require('normalize.css/normalize.css')
require('styles/App.css')


export default class SubComponent extends React.Component {
	render() {
		return (
			<div>
				<div className="head">
					<h1 className="title_con">Sma Sketch</h1>
					<div>
						<input type="radio" name="mode" id="pencil"/>
						<Icon name="pencil"/>
						<input type="radio" name="mode" id="eraser"/>
						<Icon name="eraser"/>
					</div>
				</div>
				<div className="main">
					<div className="canvas">
						<canvas id="myCanvas"/>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		const stopDefault = (event) => {
			if (['input', 'button'].includes(event.touches[0] && event.touches[0].target.tagName.toLowerCase())) {
				console.log('in')
				return
			}
			console.log('out')
			event.preventDefault()
		}
		['touchstart', 'touchmove', 'touchend', 'gesturestart', 'gesturechange', 'gestureend'].forEach(func => {
			document.addEventListener(func, stopDefault, false)
		})

		const socket = io.connect(window.location.hostname + ':8080')

		let isPencilMode = true

		const pencil = document.getElementById('pencil')
		const eraser = document.getElementById('eraser')
		const touchPencil = () => {
			isPencilMode = true
			pencil.click()
		}
		pencil.addEventListener('mousedown', touchPencil, false)
		pencil.addEventListener('touchstart', touchPencil, false)
		const touchEraser = () => {
			isPencilMode = false
			eraser.click()
		}
		eraser.addEventListener('mousedown', touchEraser, false)
		eraser.addEventListener('touchstart', touchEraser, false)
		pencil.click()

		const canvas = document.getElementById('myCanvas')
		const c = canvas.getContext('2d')
		let drawing = false
		let oldPos

		const parsed = queryString.parse(location.search)
		const {ox, oy} = parsed

		const w = canvas.width = window.innerWidth - pos(canvas).left - 10
		const h = canvas.height = window.innerHeight - pos(canvas).top - 10

		const offset = {
			x: ox - w / 2,
			y: oy - h / 2
		}

		c.strokeStyle = '#000000'
		c.lineWidth = 5
		c.lineJoin = 'round'
		c.lineCap = 'round'

		const bounds = {
			x1: offset.x,
			y1: offset.y,
			x2: offset.x + w,
			y2: offset.y + h
		}

		socket.emit('new:sub', {bounds: bounds})

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
					c.strokeStyle = '#000000'
					c.beginPath()
					c.moveTo(oldPos.x, oldPos.y)
					c.lineTo(pos.x, pos.y)
					c.stroke()
					c.closePath()
					const data = {
						before: oldPos,
						after: pos,
						offset: offset
					}
					socket.emit('draw', data)
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
			// areaCheck
			c.moveTo(data.before.x, data.before.y)
			c.lineTo(data.after.x, data.after.y)
			c.stroke()
			c.closePath()
		})

	}

}
