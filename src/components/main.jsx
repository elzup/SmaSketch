import React from 'react'
import io from 'socket.io-client'
import pos from 'dom.position'
import qr from 'qr-image'

require('normalize.css/normalize.css')
require('styles/App.css')

export default class MainComponent extends React.Component {
	render() {
		return (
			<body>
			<h1 className="title">Sma Sketch Canvas</h1>
			<div className="main">
				<div className="canvas">
					<canvas id="myCanvas"/>
					<div id="qr" className="qr"/>
					<div id="qr2" className="qr"/>
				</div>
			</div>
			</body>
		)
	}

	componentDidMount() {
		const socket = io.connect(window.location.hostname + ':8080')
		const canvas = document.getElementById('myCanvas')
		const qrBoxs = document.getElementsByClassName('qr')
		const c = canvas.getContext('2d')
		const activeSubs = {}
		const w = canvas.width = window.innerWidth - pos(canvas).left - 10
		const h = canvas.height = window.innerHeight - pos(canvas).top - 10
		const canvasStyle = {
			pencil: {strokeStyle: 'black', lineWidth: 5},
			eraser: {strokeStyle: 'white', lineWidth: 30}
		}
		c.lineJoin = 'round'
		c.lineCap = 'round'
		socket.on('draw', data => {
			console.log('on draw : ' + data)
			data.before.x += data.offset.x
			data.before.y += data.offset.y
			data.after.x += data.offset.x
			data.after.y += data.offset.y
			Object.assign(c, canvasStyle[data.mode])
			c.beginPath()
			c.moveTo(data.before.x, data.before.y)
			c.lineTo(data.after.x, data.after.y)
			c.stroke()
			c.closePath()
		})
		socket.on('new:sub', data => {
			console.log(data)
			activeSubs[data.id] = data
		})
		socket.on('remove', data => {
			delete activeSubs[data.id]
		})
		const qrPoses = [
			{x: 0, y: 0, vx: 4.5, vy: 5},
			{x: w / 2, y: h / 2, vx: -5, vy: 5.5}
		]
		console.log('didMount')
		const nextPos = p => {
			p.x += p.vx
			p.y += p.vy
			if (p.x + 100 > w || p.x < 0) {
				p.vx *= -1
			}
			if (p.y + 100 > h || p.y < 0) {
				p.vy *= -1
			}
		}
		const updateQr = () => {
			[0, 1].forEach(i => {
				nextPos(qrPoses[i])
				const url = `http://${window.location.host}/sub?ox=${qrPoses[i].x}&oy=${qrPoses[i].y}`
				qrBoxs[i].innerHTML = qr.imageSync(url, {type: 'svg'})
				qrBoxs[i].style.top = qrPoses[i].y + 'px'
				qrBoxs[i].style.left = qrPoses[i].x + 'px'
			})
		}
		setInterval(updateQr, 25)
	}
}
