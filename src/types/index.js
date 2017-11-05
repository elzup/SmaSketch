// @flow

export type DrawMode = 'pencil' | 'eraser'

export type Pos = {
	x: number,
	y: number,
}

export type Bound = {
	x1: number,
	y1: number,
	x2: number,
	y2: number,
}

export type CanvasState = {
	mode: DrawMode,
	drawing: boolean,
	oldPos: Pos,
}

export type Board = {
	isBB: boolean,
	w: number,
	h: number,
}

export type JoinMessage = {
	+id?: string,
	+event: 'join',
	+profile: any,
	+room: string,
	+bound?: Bound,
}

export type Draw = {
	before: Pos,
	after: Pos,
	offset: Pos,
	mode: 'pencil' | 'eraser',
}

export type DrawMessage = {
	+id?: string,
	+event: 'draw',
	+data: Draw,
}

export type SyncMessage = {
	+id?: string,
	+event: 'sync',
	+data: {
		board: Board,
	},
}

export type DisconnectMessage = {
	+id: string,
	+event: 'disconnect',
}

export type Message =
	| JoinMessage
	| DrawMessage
	| SyncMessage
	| DisconnectMessage
