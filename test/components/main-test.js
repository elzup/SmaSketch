import test from 'ava'
import React from 'react'
import {shallow} from 'enzyme'
import MainComponent from 'components/Main'
import {renderJSX, JSX} from 'jsx-test-helpers'

test('renders two `.wrapper`', t => {
	const wrapper = shallow(<MainComponent/>)
	t.true(wrapper.hasClass('wrapper'))
})
