import React from 'react'
import io from 'socket.io-client'
import pos from 'dom.position'
import queryString from 'query-string'
import qr from 'qr-image'

require('normalize.css/normalize.css')
require('styles/App.css')

export default class MainComponent extends React.Component {
	render() {
		const isBB = 'isBB' in queryString.parse(location.search)
		if (isBB) {
			require('styles/bb.css')
		}
		return (
			<div>
				<h1 className="title">Sma Sketch Canvas</h1>
				<div className="main">
					<div className="canvas">
						<canvas id="myCanvas"/>
						<div id="qr" className="qr"/>
						<div id="qr2" className="qr"/>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		const socket = io.connect(window.location.hostname)
		const canvas = document.getElementById('myCanvas')
		const qrBoxs = document.getElementsByClassName('qr')
		const c = canvas.getContext('2d')
		const activeSubs = {}
		const board = {
			isBB: 'isBB' in queryString.parse(location.search),
			w: canvas.width = window.innerWidth - pos(canvas).left - 10,
			h: canvas.height = window.innerHeight - pos(canvas).top - 10
		}

		const canvasStyle = board.isBB ? {
			pencil: {
				strokeStyle: 'white',
				lineWidth: 5,
				shadowBlur: 1,
				shadowColor: 'white'
			},
			// Black boad eraser
			eraser: {
				strokeStyle: 'rgba(0, 40, 32, 0.5)',
				lineWidth: 30,
				shadowBlur: 20,
				shadowColor: 'rgba(30, 70, 62, 0.2)'
			}
		} : {
			pencil: {strokeStyle: 'black', lineWidth: 5},
			eraser: {strokeStyle: 'white', lineWidth: 30}
		}
		const qrPoses = [
			{x: 0, y: 0, vx: 1.25, vy: 3},
			{x: board.w / 2, y: board.h / 2, vx: -3, vy: 1.25}
		]
		const nextPos = p => {
			p.x += p.vx
			p.y += p.vy
			if (p.x + 100 > board.w || p.x < 0) {
				p.vx *= -1
			}
			if (p.y + 100 > board.h || p.y < 0) {
				p.vy *= -1
			}
		}
		const canvasConf = {lineJoin: 'round', lineCap: 'round'}
		const bbCanvasConf = { lineJoin: 'bevel', lineCap: 'square'
		}
		Object.assign(c, board.isBB ? bbCanvasConf : canvasConf)
		socket.on('draw', data => {
			Object.assign(c, canvasStyle[data.mode])
			c.beginPath()
			c.moveTo(data.before.x + data.offset.x, data.before.y + data.offset.y)
			c.lineTo(data.after.x + data.offset.x, data.after.y + data.offset.y)
			c.stroke()
			c.closePath()
		})
		socket.on('new:sub', data => {
			activeSubs[data.id] = data
			const syncData = {
				board: board,
				id: data.id
			}
			socket.emit('new:sub:sync', syncData)
		})
		socket.on('remove', data => {
			delete activeSubs[data.id]
		})
		setInterval(() => {
			[0, 1].forEach(i => {
				nextPos(qrPoses[i])
				const url = `http://${window.location.host}/sub?ox=${qrPoses[i].x}&oy=${qrPoses[i].y}`
				qrBoxs[i].innerHTML = qr.imageSync(url, {type: 'svg'})
				qrBoxs[i].style.top = qrPoses[i].y + 'px'
				qrBoxs[i].style.left = qrPoses[i].x + 'px'
			})
		}, 50)
	}
}
