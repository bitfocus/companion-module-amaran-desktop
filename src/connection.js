import WebSocket from 'ws'
import crypto from 'crypto'
import { EventEmitter } from 'events'

export class AmaranConnection extends EventEmitter {
	constructor(instance) {
		super()
		this.instance = instance
		this.ws = null
		this.version = undefined
		this.clientId = `companion-${Date.now()}`
		this.reconnectTimer = null
		this.pendingRequests = new Map()
		this.requestId = 0
	}

	generateToken() {
		const key = crypto.randomBytes(32)
		const iv = crypto.randomBytes(12)
		const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
		const timestamp = Math.floor(Date.now() / 1000)
		let encrypted = cipher.update(timestamp.toString(), 'utf8', 'hex')
		encrypted += cipher.final('hex')
		const authTag = cipher.getAuthTag()
		return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]).toString('base64')
	}

	connect() {
		if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
			return
		}

		const host = this.instance.config?.host || '127.0.0.1'
		const port = this.instance.config?.port || 33782
		const url = `ws://${host}:${port}/ws`

		this.instance.log('debug', `Connecting to ${url}`)

		try {
			this.ws = new WebSocket(url)

			this.ws.on('open', () => {
				this.instance.log('info', 'Connected to Amaran Desktop')
				this.clearReconnectTimer()
				
				// Query protocol version first
				this.sendRequest({ action: 'get_protocol_versions' })
				
				this.emit('connected')
			})

			this.ws.on('message', (data) => {
				try {
					const msg = JSON.parse(data.toString())
					this.handleMessage(msg)
				} catch (err) {
					this.instance.log('error', `Failed to parse message: ${err.message}`)
				}
			})

			this.ws.on('close', () => {
				this.instance.log('info', 'Disconnected from Amaran Desktop')
				this.version = undefined
				this.emit('disconnected')
				this.scheduleReconnect()
			})

			this.ws.on('error', (err) => {
				this.instance.log('debug', `WebSocket error: ${err.message}`)
				this.emit('error', err)
			})
		} catch (err) {
			this.instance.log('error', `Failed to create WebSocket: ${err.message}`)
			this.scheduleReconnect()
		}
	}

	disconnect() {
		this.clearReconnectTimer()
		if (this.ws) {
			this.ws.close()
			this.ws = null
		}
	}

	isConnected() {
		return this.ws && this.ws.readyState === WebSocket.OPEN
	}

	scheduleReconnect() {
		this.clearReconnectTimer()
		const interval = this.instance.config?.reconnectInterval || 5000
		this.reconnectTimer = setTimeout(() => {
			this.instance.log('debug', 'Attempting to reconnect...')
			this.connect()
		}, interval)
	}

	clearReconnectTimer() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
	}

	handleMessage(msg) {
		this.instance.log('debug', `Received: ${JSON.stringify(msg)}`)

		// Update protocol version
		if (msg.version !== undefined) {
			this.version = msg.version
		}

		// Handle response to a request
		if (msg.type === 'response') {
			const requestKey = `${msg.client_id}-${msg.action}`
			const pending = this.pendingRequests.get(requestKey)
			if (pending) {
				this.pendingRequests.delete(requestKey)
				pending.resolve(msg)
			}

			// Process response data and emit state updates
			this.processResponseState(msg)
		}

		// Handle events (push notifications)
		if (msg.type === 'event') {
			this.processEvent(msg)
		}
	}

	processResponseState(msg) {
		if (msg.code !== 0) return

		const nodeId = msg.node_id
		if (!nodeId) return

		switch (msg.action) {
			case 'get_sleep':
			case 'set_sleep':
			case 'toggle_sleep':
				this.emit('deviceState', nodeId, { power: !msg.data })
				break

			case 'get_intensity':
			case 'set_intensity':
			case 'increase_intensity':
				this.emit('deviceState', nodeId, { intensity: msg.data / 10 })
				break

			case 'get_cct':
			case 'set_cct':
			case 'increase_cct':
				if (typeof msg.data === 'object') {
					this.emit('deviceState', nodeId, {
						cct: msg.data.cct,
						intensity: msg.data.intensity / 10
					})
				}
				break
		}
	}

	processEvent(msg) {
		const nodeId = msg.node_id
		if (!nodeId) return

		switch (msg.event) {
			case 'sleep_changed':
				this.emit('deviceState', nodeId, { power: !msg.data })
				break

			case 'intensity_changed':
				this.emit('deviceState', nodeId, { intensity: msg.data / 10 })
				break

			case 'cct_changed':
				this.emit('deviceState', nodeId, {
					cct: msg.data.cct,
					intensity: msg.data.intensity / 10
				})
				break

			case 'hsi_changed':
				this.emit('deviceState', nodeId, {
					hue: msg.data.hue,
					saturation: msg.data.sat,
					intensity: msg.data.intensity / 10
				})
				break

			case 'rgb_changed':
				this.emit('deviceState', nodeId, {
					color: msg.data.color,
					intensity: msg.data.intensity / 10
				})
				break

			case 'effect_changed':
				this.emit('deviceState', nodeId, {
					effect: msg.data.effect_type,
					intensity: msg.data.intensity / 10
				})
				break
		}
	}

	sendRequest({ node_id, action, args }) {
		if (!this.isConnected()) {
			this.instance.log('debug', 'Cannot send request - not connected')
			return
		}

		const message = this.buildMessage({ node_id, action, args })
		this.instance.log('debug', `Sending: ${JSON.stringify(message)}`)
		this.ws.send(JSON.stringify(message))
	}

	async sendRequestWithResponse({ node_id, action, args }, timeout = 5000) {
		if (!this.isConnected()) {
			return null
		}

		return new Promise((resolve) => {
			const requestKey = `${this.clientId}-${action}`
			
			const timeoutId = setTimeout(() => {
				this.pendingRequests.delete(requestKey)
				resolve(null)
			}, timeout)

			this.pendingRequests.set(requestKey, {
				resolve: (msg) => {
					clearTimeout(timeoutId)
					resolve(msg)
				}
			})

			this.sendRequest({ node_id, action, args })
		})
	}

	buildMessage({ node_id, action, args }) {
		if (this.version === undefined || this.version >= 2) {
			return {
				version: 2,
				type: 'request',
				client_id: this.clientId,
				request_id: `req-${++this.requestId}`,
				node_id,
				action,
				args: args || {},
				token: this.generateToken()
			}
		} else {
			// Version 0 (legacy)
			// Note: Some actions have different names in v0
			const v0Action = {
				'increase_intensity': 'increment_intensity',
				'increase_cct': 'increment_cct'
			}[action] || action

			return {
				version: 0,
				type: v0Action,
				client_id: this.clientId,
				node_id,
				args: args || {}
			}
		}
	}
}
