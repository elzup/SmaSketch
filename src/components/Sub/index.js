// @flow
import React from 'react'
import io from 'socket.io-client'
import pos from 'dom.position'
import FontAwesome from 'react-fontawesome'

import type { Draw, JoinMessage, DrawMessage, CanvasState } from '../../types'

import { Tools, CanvasCon, Button } from '../'
import { injectGlobal } from 'styled-components'

const url = 'https://gwss.elzup.com/base'

type Props = {
	room: string,
	ox: number,
	oy: number,
}

type State = { mode: string }

export default class SubComponent extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = {
			mode: 'pencil',
		}
		// HACKME: canvas and react matching so boad
		//         we use static property for stop rerender
		this.cstate = {
			mode: 'pencil',
			board: null,
			drawing: false,
			oldPos: { x: 0, y: 0 },
		}
	}

	render() {
		return (
			<div>
				<CanvasCon>
					<canvas id="myCanvas" />
				</CanvasCon>
				<Tools>
					<Button
						id="pencil-btn"
						active={this.state.mode === 'pencil'}
						onClick={() => {
							this.setState({ mode: 'pencil' })
							this.cstate.mode = 'pencil'
						}}
					>
						<FontAwesome name="pencil" size="2x" />
					</Button>
					<Button
						id="eraser-btn"
						active={this.state.mode === 'eraser'}
						onClick={() => {
							this.setState({ mode: 'eraser' })
							this.cstate.mode = 'eraser'
						}}
					>
						<FontAwesome name="eraser" size="2x" />
					</Button>
				</Tools>
			</div>
		)
	}

	componentDidMount() {
		const socket = io.connect(url)
		socket.on('connect', () => {
			this.init(socket)
		})

		injectGlobal`
		body {
		background: white;
	}
		`
	}

	init(socket: any) {
		const { cstate } = this
		const { room, ox, oy } = this.props
		if (document === null) {
			console.error('Not found dom.')
			return
		}
		const canvas: any = document.getElementById('myCanvas')
		const pencil: any = document.getElementById('pencil-btn')
		const eraser: any = document.getElementById('eraser-btn')
		if (pencil === null || eraser === null) {
			console.error('Not found pencil, eraser.')
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
			canvas.addEventListener(func, stopDefault, false)
		})
		const c = canvas.getContext('2d')

		const w = (canvas.width = window.innerWidth - pos(canvas).left)
		const h = (canvas.height = window.innerHeight - pos(canvas).top - 100)
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
		canvas.addEventListener(
			'touchstart',
			event => {
				cstate.drawing = true
				cstate.oldPos = getPosTouch(event)
			},
			false,
		)
		canvas.addEventListener(
			'touchend',
			() => {
				cstate.drawing = false
			},
			false,
		)
		const touchMove = event => {
			const pos = getPosTouch(event)
			if (!cstate.drawing) {
				return
			}
			Object.assign(c, canvasStyle[cstate.mode])
			c.beginPath()
			c.moveTo(cstate.oldPos.x, cstate.oldPos.y)
			c.lineTo(pos.x, pos.y)
			c.stroke()
			c.closePath()
			Object.assign(c, canvasStyle.pencil)
			c.beginPath()
			c.rect(0 - offset.x, 0 - offset.y, cstate.board.w, cstate.board.h)
			c.stroke()
			c.closePath()
			const data: Draw = {
				before: cstate.oldPos,
				after: pos,
				offset: offset,
				mode: cstate.mode,
			}
			const msg: DrawMessage = { event: 'draw', data }
			socket.emit('msg', msg)
			cstate.oldPos = pos
		}

		socket.on('msg', msg => {
			switch (msg.event) {
				case 'sync':
					const { data } = msg
					console.log(data)
					cstate.board = data.board
					// draw line frame
					Object.assign(c, canvasStyle.pencil)
					c.rect(0 - offset.x, 0 - offset.y, cstate.board.w, cstate.board.h)
					c.stroke()
					break
				default:
					break
			}
		})
		canvas.addEventListener('touchmove', touchMove, false)
		c.lineJoin = 'round'
		c.lineCap = 'round'
	}
}
