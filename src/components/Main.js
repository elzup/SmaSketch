import io from 'socket.io-client'
import pos from 'dom.position'
import qr from 'qr-image'

require('normalize.css/normalize.css')
require('styles/App.css')

import React from 'react'

export default class MainComponent extends React.Component {
	render() {
		return (
			<div>
				<h1 className="title">Sma Sketch Canvas</h1>
				<div className="main">
					<div className="canvas">
						<canvas id="myCanvas"/>
						<div id="qr" className="qr"/>
					</div>
				</div>
			</div>
		)
	}

	static defaultComponent = {}

	componentDidMount() {

		const socket = io.connect(window.location.hostname + ':8080')
		const canvas = document.getElementById('myCanvas')
		const qrBox = document.getElementById('qr')
		const c = canvas.getContext('2d')
		const activeSubs = {}

		const h = canvas.width = window.innerWidth - pos(canvas).left - 10
		const w = canvas.height = window.innerHeight - pos(canvas).top - 10

		c.strokeStyle = '#000000'
		c.lineWidth = 5
		c.lineJoin = 'round'
		c.lineCap = 'round'

		socket.on('draw', data => {
			console.log('on draw : ' + data)
			data.before.x += data.offset.x
			data.before.y += data.offset.y
			data.after.x += data.offset.x
			data.after.y += data.offset.y
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
		const qrPos = { x: 0, y: 0 }

		console.log('didMount')
		const updateQr = () => {
			qrPos.x ++
			qrPos.y ++
			const url = `http://${window.location.host}/sub?ox=${qrPos.x}&oy=${qrPos.y}`
			qrBox.innerHTML = qr.imageSync(url, {type: 'svg'})
			console.log(qrPos)
			qrBox.style.top = qrPos.y + 'px'
			qrBox.style.left = qrPos.x + 'px'
		}
		setInterval(updateQr, 10)
	}
}
