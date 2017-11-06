// @flow
import React from 'react'
import io from 'socket.io-client'
import pos from 'dom.position'
import qr from 'qr-image'
import { config } from '../../config'

import type { Message, Board, JoinMessage, SyncMessage } from '../../types'

import { Title, Main, CanvasWrap, QR } from '../'

const url = 'https://gwss.elzup.com/base'

type Props = {
	room: string,
}

export default class MainComponent extends React.Component<Props> {
	render() {
		return (
			<div>
				<Title>Sma Sketch Canvas</Title>
				<Main>
					<CanvasWrap>
						<canvas id="myCanvas" />
						<QR id="qr" className="qr" />
						<QR id="qr2" className="qr" />
					</CanvasWrap>
				</Main>
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
		const { room } = this.props
		if (document === null) {
			console.error('Not found dom.')
			return
		}
		const canvas: any = document.getElementById('myCanvas')
		const qrBoxs = document.getElementsByClassName('qr')
		const msg: JoinMessage = { event: 'join', room, profile: 'a' }
		socket.emit('join', msg)
		const c = canvas.getContext('2d')
		const activeSubs = {}
		const board: Board = {
			isBB: true,
			w: (canvas.width = window.innerWidth - pos(canvas).left - 10),
			h: (canvas.height = window.innerHeight - pos(canvas).top - 10),
		}

		const canvasStyle = board.isBB
			? {
					pencil: {
						strokeStyle: 'white',
						lineWidth: 5,
						shadowBlur: 1,
						shadowColor: 'white',
					},
					// Black boad eraser
					eraser: {
						strokeStyle: 'rgba(0, 40, 32, 0.5)',
						lineWidth: 30,
						shadowBlur: 20,
						shadowColor: 'rgba(30, 70, 62, 0.2)',
					},
				}
			: {
					pencil: { strokeStyle: 'black', lineWidth: 5 },
					eraser: { strokeStyle: 'white', lineWidth: 30 },
				}
		const qrPoses = [
			{ x: 0, y: 0, vx: 1.25, vy: 3 },
			{ x: board.w / 2, y: board.h / 2, vx: -3, vy: 1.25 },
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
		const canvasConf = { lineJoin: 'round', lineCap: 'round' }
		const bbCanvasConf = {
			lineJoin: 'bevel',
			lineCap: 'square',
		}
		Object.assign(c, board.isBB ? bbCanvasConf : canvasConf)
		socket.on('msg', (msg: Message) => {
			console.log(msg)
			switch (msg.event) {
				case 'draw':
					const { data } = msg
					Object.assign(c, canvasStyle[data.mode])
					c.beginPath()
					c.moveTo(data.before.x + data.offset.x, data.before.y + data.offset.y)
					c.lineTo(data.after.x + data.offset.x, data.after.y + data.offset.y)
					c.stroke()
					c.closePath()
					break
				case 'join':
					if (msg.event === 'join' && msg.id) {
						// HACK: Why no type ...
						activeSubs[msg.id] = msg.profile
						console.log(activeSubs)
						const rep: SyncMessage = {
							event: 'sync',
							data: { board },
						}
						socket.emit('msg', rep)
					}
					break
				case 'disconnect':
					delete activeSubs[msg.id]
					break
				default:
					break
			}
		})
		setInterval(() => {
			;[0, 1].forEach(i => {
				nextPos(qrPoses[i])
				const url = `${config.url}?sub&ox=${qrPoses[i].x}&oy=${qrPoses[i].y}`
				qrBoxs[i].innerHTML = qr.imageSync(url, { type: 'svg' })
				qrBoxs[i].style.top = qrPoses[i].y + 'px'
				qrBoxs[i].style.left = qrPoses[i].x + 'px'
			})
		}, 50)
	}
}
