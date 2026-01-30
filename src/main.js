import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { getActions } from './actions.js'
import { getFeedbacks } from './feedbacks.js'
import { getPresets } from './presets.js'
import { AmaranConnection } from './connection.js'

class AmaranInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.connection = null
		this.devices = []
		this.scenes = []
		this.quickshots = []
		this.presets = []
		this.deviceStates = new Map()
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)
		
		this.connection = new AmaranConnection(this)
		this.connection.on('connected', () => {
			this.updateStatus(InstanceStatus.Ok)
			this.refreshDevices()
		})
		this.connection.on('disconnected', () => {
			this.updateStatus(InstanceStatus.Disconnected)
		})
		this.connection.on('error', (err) => {
			this.log('error', `Connection error: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
		})
		this.connection.on('deviceState', (nodeId, state) => {
			this.deviceStates.set(nodeId, { ...this.deviceStates.get(nodeId), ...state })
			this.checkFeedbacks()
		})
		
		this.connection.connect()
		
		this.setActionDefinitions(getActions(this))
		this.setFeedbackDefinitions(getFeedbacks(this))
		this.setPresetDefinitions(getPresets(this))
	}

	async destroy() {
		if (this.connection) {
			this.connection.disconnect()
		}
	}

	async configUpdated(config) {
		this.config = config
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module connects to the Amaran Desktop application running on this computer. Make sure the Amaran Desktop app is running before connecting.'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Host',
				default: '127.0.0.1',
				width: 8
			},
			{
				type: 'number',
				id: 'port',
				label: 'Port',
				default: 33782,
				min: 1,
				max: 65535,
				width: 4
			},
			{
				type: 'number',
				id: 'reconnectInterval',
				label: 'Reconnect Interval (ms)',
				default: 5000,
				min: 1000,
				max: 60000,
				width: 6
			}
		]
	}

	async refreshDevices() {
		if (!this.connection || !this.connection.isConnected()) return

		// Get device list
		const devices = await this.connection.sendRequestWithResponse({
			action: 'get_device_list'
		})
		if (devices && devices.data) {
			this.devices = devices.data
			this.log('info', `Found ${this.devices.length} devices`)
		}

		// Get scene list
		const scenes = await this.connection.sendRequestWithResponse({
			action: 'get_scene_list'
		})
		if (scenes && scenes.data) {
			this.scenes = scenes.data
			this.log('info', `Found ${this.scenes.length} scenes`)
		}

		// Get quickshot list
		const quickshots = await this.connection.sendRequestWithResponse({
			action: 'get_quickshot_list'
		})
		if (quickshots && quickshots.data && Array.isArray(quickshots.data)) {
			this.quickshots = quickshots.data
			this.log('info', `Found ${this.quickshots.length} quickshots`)
		} else {
			this.quickshots = []
		}

		// Get preset list
		const presets = await this.connection.sendRequestWithResponse({
			action: 'get_preset_list'
		})
		if (presets && presets.data && Array.isArray(presets.data)) {
			this.presets = presets.data
			this.log('info', `Found ${this.presets.length} presets`)
		} else {
			this.presets = []
		}

		// Update variable definitions with discovered devices
		this.updateVariableDefinitions()

		// Re-register actions and feedbacks with updated device list
		this.setActionDefinitions(getActions(this))
		this.setFeedbackDefinitions(getFeedbacks(this))

		// Get initial state for each device
		for (const device of this.devices) {
			this.connection.sendRequest({
				node_id: device.node_id,
				action: 'get_sleep'
			})
			this.connection.sendRequest({
				node_id: device.node_id,
				action: 'get_intensity'
			})
			this.connection.sendRequest({
				node_id: device.node_id,
				action: 'get_cct'
			})
		}
	}

	updateVariableDefinitions() {
		const variables = []
		
		for (const device of this.devices) {
			const safeName = device.name?.replace(/[^a-zA-Z0-9]/g, '_') || device.node_id
			variables.push(
				{ variableId: `${safeName}_power`, name: `${device.name} Power` },
				{ variableId: `${safeName}_intensity`, name: `${device.name} Intensity` },
				{ variableId: `${safeName}_cct`, name: `${device.name} CCT` }
			)
		}
		
		this.setVariableDefinitions(variables)
	}

	getDeviceChoices() {
		const choices = []
		
		for (const device of this.devices) {
			choices.push({
				id: device.node_id,
				label: device.name || device.node_id
			})
		}
		
		for (const scene of this.scenes) {
			choices.push({
				id: scene.node_id,
				label: `[Scene] ${scene.name || scene.node_id}`
			})
		}
		
		if (choices.length === 0) {
			choices.push({
				id: '',
				label: 'No devices found - check Amaran Desktop'
			})
		}
		
		return choices
	}

	getDeviceState(nodeId) {
		return this.deviceStates.get(nodeId) || {}
	}

	getQuickshotChoices() {
		const choices = []

		for (const quickshot of this.quickshots) {
			choices.push({
				id: quickshot.id || quickshot.quickshot_id,
				label: quickshot.name || quickshot.id || quickshot.quickshot_id
			})
		}

		if (choices.length === 0) {
			choices.push({
				id: '',
				label: 'No quickshots found'
			})
		}

		return choices
	}

	getPresetChoices() {
		const choices = []

		for (const preset of this.presets) {
			choices.push({
				id: preset.id || preset.preset_id,
				label: preset.name || preset.id || preset.preset_id
			})
		}

		if (choices.length === 0) {
			choices.push({
				id: '',
				label: 'No presets found'
			})
		}

		return choices
	}
}

runEntrypoint(AmaranInstance, [])
