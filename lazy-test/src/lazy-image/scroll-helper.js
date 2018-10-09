import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

const OPTIMIZE_IMG_LOADING = true
const DEBOUNCE_TIMEOUT = 100
const DEBUG = true

export const offsetTop = (element) => {
	let top
	while (element.offsetTop === void 0) {
	  element = element.parentNode
	}
	top = element.offsetTop
	while (element = element.offsetParent) {
	  top += element.offsetTop
	}
	return top
  }

/*
* @param {HTMLElement} node
* @param {number} threshold Pixels outside viewport to fire
* @param {number} y Current page scroll position
*/
export const inViewPort = (node, threshold = 0.05, y = window.pageYOffset) => {
	const nodeTop = offsetTop(node)
	const nodeBot = nodeTop + node.offsetHeight
	const offset = threshold * window.innerHeight

	return nodeBot >= y - offset && nodeTop <= y + window.innerHeight + offset
}

const searchBinary = (arr, min, max) => {
	const mid = parseInt((min + max) / 2, 10)

	if (DEBUG) {
		/* eslint-disable no-console */
		console.log('Boundry to check : ', min, ' ', max)
	}

	if (min === mid || mid === max) {
		return mid
	}

	const { node } = arr[mid]
	if (node) {
		if (inViewPort(node)) {
			if (DEBUG) {
				/* eslint-disable no-console */
				console.log('Visible item encountered : ', mid)
				node.style.border = '1px solid red'
			}

			return mid
		}

		const pageY = window.pageYOffset
		const nodeTop = node.getBoundingClientRect().top + pageY
		const nodeBot = nodeTop + node.offsetHeight

		/* eslint-disable */
		if (nodeBot < pageY) {
			return searchBinary(arr, mid, max)
		} else {
			return searchBinary(arr, min, mid)
		} /* eslint-enable */
	}

	return mid
}

// queue which will hold handlers
let queue = []

/**
 * @method pushToScrollQueue
 * @description When component is mounted, push the handler in the queue
 * @param {function} handler
 */
export const pushToScrollQueue = handler => {
	queue.push(handler)
}

/**
 * @method removeFromScrollQueue
 * @description Remove handler from scroll queue
 * @param {function} handler
 */
export const removeFromScrollQueue = handler => {
	const index = queue.indexOf(handler)
	if (index >= 0) {
		queue[index] = null

		// This function gets called when component is unmounted and handler is requested
		// to be removed from the scroll handling queue.
		// Debounce filtering to batch the unmount process
		debounce(() => {
			queue = queue.filter(_ => _)
		}, 100)
	}
}

/**
 * @function handleScroll
 * @description Go through the queue and process it.
 * 				To minimize iteration, apply binary search for larger queue length
 *
 */
const handleScroll = () => {
	queue = queue.filter(_ => _)

	if (queue.length === 0) {
		if (DEBUG) {
			console.log('Nothing to process : All lazy images are loaded.')
		}

		return
	}

	let start = 0
	let end = queue.length

	// Minimum 10 images are scanned for view port, so o(n) = 10
	// So complexity for binary search of 10 images is o(log2(n)) = 3.32
	// So it is expensive to run binary search below 14 images, rounding off to obvious value 15
	// Considering maximum 5 items in view port at max.
	// 5 images visible, on an average, 10 images are scanned and complexity 3.32. Value is roughly around 20
	// Enable optimization only when lazy image view port scanning for more than 20 images
	const shouldOptimize = OPTIMIZE_IMG_LOADING && queue.length > 20

	let binIndex = 0

	// If optimization flag is ON, use binary search to track down
	// one visible item and then use -5 , +5 items from that index
	if (shouldOptimize) {
		binIndex = searchBinary(queue, 0, queue.length)	
		start = Math.max(0, binIndex - 5)
		end = Math.min(queue.length, binIndex + 5)
	}

	if (DEBUG) {
		/* eslint-disable no-console */
		console.log('processing queue : ', queue.length)
		/* eslint-disable no-console */
		console.log('processing from : ', start, ' ', end)
		console.time('t')
	}
	if(queue[binIndex]){
		for (let index = start; index < end; index++) {
			if (queue[index] && queue[index].handler) {
				const isVisible = queue[index].handler()
				if (isVisible) {
					queue[index] = null
				}
			}
		} 
	}
	
	if (DEBUG) {
		console.timeEnd('t')
	}
}

/**
 * @function registerLazyImageScrollHandler
 * @description
 */
export const registerLazyImageScrollHandler = () => {
	window.addEventListener(
		'scroll',
		throttle(handleScroll, DEBOUNCE_TIMEOUT),
		true
	)
}


