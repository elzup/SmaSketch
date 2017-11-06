// @flow

type Config = {
	basename: string,
	url: string,
}

const productionConfig: Config = {
	basename: '/SmaSketch',
	url: 'https://elzup.github.io/SmaSketch/',
}

const developmentConfig: Config = {
	basename: '/',
	url: 'http://localhost:3000/',
}

export const config: Config =
	process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig
