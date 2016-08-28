import test from 'ava'
import React from 'react'
import {shallow} from 'enzyme'
import Main from 'components/Main'


test('renders two `.Bar`', t => {
	const wrapper = shallow(<Main/>);
	t.is(wrapper.find('.bar').length, 2);
});
