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
					<div className="tools">
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
		const socket = io.connect(window.location.hostname + ':8080')
		const stopDefault = event => {
			if (!['input', 'button'].includes(event.touches[0] && event.touches[0].target.tagName.toLowerCase())) {
				event.preventDefault()
			}
		}
		['touchstart', 'touchmove', 'touchend', 'gesturestart', 'gesturechange', 'gestureend'].forEach(func => {
			document.addEventListener(func, stopDefault, false)
		})
		let mode = 'pencil'
		const pencil = document.getElementById('pencil')
		const eraser = document.getElementById('eraser')
		const canvas = document.getElementById('myCanvas')
		const c = canvas.getContext('2d')
		let drawing = false
		let oldPos
		const {ox, oy} = queryString.parse(location.search)
		const w = canvas.width = window.innerWidth - pos(canvas).left - 10
		const h = canvas.height = window.innerHeight - pos(canvas).top - 5
		const offset = {x: ox - (w / 2), y: oy - (h / 2)}
		const canvasStyle = {
			pencil: {strokeStyle: 'black', lineWidth: 5},
			eraser: {strokeStyle: 'white', lineWidth: 30}
		}
		const bounds = {
			x1: offset.x,
			y1: offset.y,
			x2: offset.x + w,
			y2: offset.y + h
		}
		const getPosTouch = event => ({
			x: event.touches[0].clientX - pos(canvas).left,
			y: event.touches[0].clientY - pos(canvas).top
		})
		pencil.addEventListener('touchstart', () => {
			mode = 'pencil'
			pencil.click()
		}, false)
		eraser.addEventListener('touchstart', () => {
			mode = 'eraser'
			eraser.click()
		}, false)
		canvas.addEventListener('touchstart', event => {
			drawing = true
			oldPos = getPosTouch(event)
		}, false)
		canvas.addEventListener('touchend', () => {
			drawing = false
		}, false)
		const touchMove = event => {
			const pos = getPosTouch(event)
			if (!drawing) {
				return
			}
			Object.assign(c, canvasStyle[mode])
			c.beginPath()
			c.moveTo(oldPos.x, oldPos.y)
			c.lineTo(pos.x, pos.y)
			c.stroke()
			c.closePath()
			const data = {before: oldPos, after: pos, offset: offset, mode: mode}
			socket.emit('draw', data)
			oldPos = pos
		}
		socket.on('new:sub:sync', (data) => {
			console.log(data)
			const { board } = data
			// draw line frame
			c.rect(0 - offset.x, 0 - offset.y, board.w, board.h)
			c.stroke()
		})
		canvas.addEventListener('touchmove', touchMove, false)
		c.lineJoin = 'round'
		c.lineCap = 'round'
		pencil.click()
		socket.emit('new:sub', {bounds: bounds})
	}
}
