// @flow
import React from 'react'
import io from 'socket.io-client'
import pos from 'dom.position'
import queryString from 'query-string'
import { Icon } from 'react-fa'
import type {
	Pos,
	Draw,
	Message,
	JoinMessage,
	DrawMessage,
	SyncMessage,
	CanvasState,
} from '../../types'

const url = 'https://gwss.elzup.com/base'

require('../../styles/App.css')

type Props = {
	room: string,
	ox: number,
	oy: number,
}

export default class SubComponent extends React.Component<Props, {}> {
	render() {
		return (
			<div>
				<div className="head">
					<h1 className="title_con">Sma Sketch</h1>
					<div className="tools">
						<input type="radio" name="mode" id="pencil" />
						<Icon name="pencil" />
						<input type="radio" name="mode" id="eraser" />
						<Icon name="eraser" />
					</div>
				</div>
				<div className="main">
					<div className="canvas">
						<canvas id="myCanvas" />
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		const socket = io.connect(url)
		socket.on('connect', () => {
			this.init(socket)
		})
	}

	init(socket: any) {
		const { room, ox, oy } = this.props
		const {} = this.props
		if (document === null) {
			console.error('Not found dom.')
			return
		}
		const pencil = document.getElementById('pencil')
		const eraser = document.getElementById('eraser')
		const canvas: any = document.getElementById('myCanvas')
		if (pencil === null || eraser === null || canvas === null) {
			console.error('Not found dom.')
			return
		}
		const stopDefault = (event: any) => {
			if (
				!['input', 'button'].includes(
					event.touches[0] && event.touches[0].target.tagName.toLowerCase(),
				)
			) {
				event.preventDefault()
			}
		}
		const events: string[] = [
			'touchstart',
			'touchmove',
			'touchend',
			'gesturestart',
			'gesturechange',
			'gestureend',
		]
		events.forEach((func: string) => {
			document.addEventListener(func, stopDefault, false)
		})
		const c = canvas.getContext('2d')
		const state: CanvasState = {
			mode: 'pencil',
			drawing: false,
			oldPos: { x: 0, y: 0 },
		}
		const w = (canvas.width = window.innerWidth - pos(canvas).left - 10)
		const h = (canvas.height = window.innerHeight - pos(canvas).top - 5)
		const offset = { x: ox - w / 2, y: oy - h / 2 }
		const canvasStyle = {
			pencil: { strokeStyle: 'black', lineWidth: 5 },
			eraser: { strokeStyle: 'white', lineWidth: 30 },
		}
		const bound = {
			x1: offset.x,
			y1: offset.y,
			x2: offset.x + w,
			y2: offset.y + h,
		}
		const msg: JoinMessage = {
			event: 'join',
			room,
			profile: 'a',
			bound,
		}
		socket.emit('join', msg)
		const getPosTouch = event => ({
			x: event.touches[0].clientX - pos(canvas).left,
			y: event.touches[0].clientY - pos(canvas).top,
		})
		pencil.addEventListener(
			'touchstart',
			() => {
				state.mode = 'pencil'
				pencil.click()
			},
			false,
		)
		eraser.addEventListener(
			'touchstart',
			() => {
				state.mode = 'eraser'
				eraser.click()
			},
			false,
		)
		canvas.addEventListener(
			'touchstart',
			event => {
				state.drawing = true
				state.oldPos = getPosTouch(event)
			},
			false,
		)
		canvas.addEventListener(
			'touchend',
			() => {
				state.drawing = false
			},
			false,
		)
		const touchMove = event => {
			const pos = getPosTouch(event)
			if (!state.drawing) {
				return
			}
			Object.assign(c, canvasStyle[state.mode])
			c.beginPath()
			c.moveTo(state.oldPos.x, state.oldPos.y)
			c.lineTo(pos.x, pos.y)
			c.stroke()
			c.closePath()
			const data: Draw = {
				before: state.oldPos,
				after: pos,
				offset: offset,
				mode: state.mode,
			}
			const msg: DrawMessage = { event: 'draw', data }
			socket.emit('msg', msg)
			state.oldPos = pos
		}

		socket.on('msg', msg => {
			switch (msg.event) {
				case 'sync':
					const { data } = msg
					console.log(data)
					const { board } = data
					// draw line frame
					c.rect(0 - offset.x, 0 - offset.y, board.w, board.h)
					c.stroke()
				default:
			}
		})
		canvas.addEventListener('touchmove', touchMove, false)
		c.lineJoin = 'round'
		c.lineCap = 'round'
		pencil.click()
	}
}
