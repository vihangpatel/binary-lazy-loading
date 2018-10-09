import { Component } from 'react'
import ReactDOM from 'react-dom'

import {
	inViewPort,
	pushToScrollQueue,
	removeFromScrollQueue,
} from './scroll-helper'

class Visible extends Component {
	constructor() {
		super()

		this.state = {
			visible: false, // eslint-disable-line
		}

		this.checkViewPort = this.checkViewPort.bind(this)
		this.getNode = this.getNode.bind(this)
	}

	componentDidMount() {
		this.pushToScrollQueue()
		this.checkViewPort()
	}

	componentWillUnmount() {
		removeFromScrollQueue(this.queueObject)
	}

	getNode() {
		if (!this.node) {
			this.node = ReactDOM.findDOMNode(this) // eslint-disable-line
		}

		return this.node
	}

	pushToScrollQueue() {
		const node = this.getNode()
		const isVisible = inViewPort(node)

		if (!isVisible) {
			this.queueObject = { handler: this.checkViewPort, node }
			pushToScrollQueue(this.queueObject)
		}
	}

	checkViewPort() {
		const node = ReactDOM.findDOMNode(this) // eslint-disable-line
		const visible = inViewPort(node)
		if(this.state.visible !== visible) {
			this.setState({
				visible,
			})
		}

		return visible
	}

	render() {
		const { children } = this.props
		const props = { ...children.props, visible: this.state.visible }

		return {
			...children,
			props,
		}
	}
}

export default Visible
