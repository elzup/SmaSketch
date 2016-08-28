import io from 'socket.io-client'
import $ from 'jquery'

require('normalize.css/normalize.css')
require('styles/App.css')

import React from 'react'

export default class MainComponent extends React.Component {
	render() {
		return (
			<div>
				<h1 className="title">Sma Sketch</h1>
				<div className="main">
					<div className="clear"></div>
					<div className="canvas">
						<canvas id="myCanvas"></canvas>
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

		// サーバーサイドのsocket.IOに接続する
		// 接続出来たら、サーバー側のコンソールにconnected!と表示される
		var socket = io.connect(window.location.hostname + ':8080')

		// Canvas描画に必要な変数を定義する
		var canvas = document.getElementById('myCanvas')
		var c = canvas.getContext('2d')
		var drawing = false
		var oldPos

		var w = window.innerWidth
		var h = window.innerHeight
		canvas.width = w - 20
		canvas.height = h - 100

		// Canvasを初期化する
		c.strokeStyle = '#000000'
		c.lineWidth = 5
		c.lineJoin = 'round'
		c.lineCap = 'round'

		// Canvas上の座標を計算する為の関数たち
		function scrollX() {
			return document.documentElement.scrollLeft || document.body.scrollLeft
		}

		function scrollY() {
			return document.documentElement.scrollTop || document.body.scrollTop
		}

		const getPosMouse = (event) => {
			var mouseX = event.clientX - $(canvas).position().left + scrollX()
			var mouseY = event.clientY - $(canvas).position().top + scrollY()
			return {x: mouseX, y: mouseY}
		}

		const getPosTouch = (event) => {
			var mouseX = event.touches[0].clientX - $(canvas).position().left + scrollX()
			var mouseY = event.touches[0].clientY - $(canvas).position().top + scrollY()
			return {x:mouseX, y:mouseY}
		}

		// function getPosT(event) {
		// 	var mouseX = event.touches[0].clientX - $(canvas).position().left + scrollX()
		// 	var mouseY = event.touches[0].clientY - $(canvas).position().top + scrollY()
		// 	return {x: mouseX, y: mouseY}
		// }


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

		// 色や太さを選択した場合の処理
		// 選択した結果を、Canvasに設定して、
		// socket.IOサーバーにも送付している
		$('#black').click(() => {
			c.strokeStyle = 'black'
			socket.emit('color', 'black')
		})
		$('#blue').click(() => {
			c.strokeStyle = 'blue'
			socket.emit('color', 'blue')
		})
		$('#red').click(() => {
			c.strokeStyle = 'red'
			socket.emit('color', 'red')
		})
		$('#green').click(() => {
			c.strokeStyle = 'green'
			socket.emit('color', 'green')
		})
		$('#small').click(() => {
			c.lineWidth = 5
			socket.emit('lineWidth', 5)
		})
		$('#middle').click(() => {
			c.lineWidth = 10
			socket.emit('lineWidth', 10)
		})
		$('#large').click(() => {
			c.lineWidth = 20
			socket.emit('lineWidth', 20)
		})

		// socket.IOサーバーから描画情報を受け取った場合の処理
		// 受け取った情報を元に、Canvasに描画を行う
		socket.on('draw', data => {
			console.log('on draw : ' + data)
			c.beginPath()
			c.moveTo(data.before.x, data.before.y)
			c.lineTo(data.after.x, data.after.y)
			c.stroke()
			c.closePath()
		})

		// socket.IOサーバーから色情報を受け取った場合の処理
		// Canvasに色を設定している
		socket.on('color', data => {
			console.log('on color : ' + data)
			c.strokeStyle = data
		})

		// socket.IOサーバーから線の太さ情報を受け取った場合の処理
		// Canvasに線の太さを設定している
		socket.on('lineWidth', data => {
			console.log('on lineWidth : ' + data)
			c.lineWidth = data
		})

	}

}
