// @flow

import styled from 'styled-components'

export const Title = styled.h1`
	padding: 10px;
	margin: 10px 0 0 10px;
`

export const TitleCon = styled.h1`
	font-size: 1em;
	margin: 0;
`

export const CanvasWrap = styled.div`
	border: 5px solid #683531;
	background: #002820;
`

export const CanvasCon = styled.div`
	position: relative;
`

export const QR = styled.div`
	width: 100px;
	height: 100px;
	background: #103830;
	position: absolute;
`

/* Base Application Styles */

export const Main = styled.div`
	padding: 10px;
	margin: auto;
`

export const Head = styled.div`
	display: flex;
	padding: 10px 10px 0 10px;
`

export const Tools = styled.div`
	display: flex;
	background: #eee;
	height: 90px;
	width: 100%;
`

export const Button = styled.button`
	height: 100%;
	width: 50%;
	background: ${p => (p.active ? '#aaa' : '#ddd')};
	color: white;
	border: none;
`
