export function getActions(instance) {
	const EFFECT_CHOICES = [
		{ id: 'paparazzi', label: 'Paparazzi' },
		{ id: 'fireworks', label: 'Fireworks' },
		{ id: 'fault_bulb', label: 'Fault Bulb' },
		{ id: 'lightning', label: 'Lightning' },
		{ id: 'tv', label: 'TV' },
		{ id: 'pulsing', label: 'Pulsing' },
		{ id: 'strobe', label: 'Strobe' },
		{ id: 'explosion', label: 'Explosion' },
		{ id: 'club_lights', label: 'Club Lights' },
		{ id: 'candle', label: 'Candle' },
		{ id: 'fire', label: 'Fire' },
		{ id: 'welding', label: 'Welding' },
		{ id: 'cop_car', label: 'Cop Car' },
		{ id: 'color_chase', label: 'Color Chase' },
		{ id: 'party_lights', label: 'Party Lights' },
		{ id: 'paparazzi2', label: 'Paparazzi 2' },
		{ id: 'fireworks2', label: 'Fireworks 2' },
		{ id: 'fault_bulb2', label: 'Fault Bulb 2' },
		{ id: 'lightning2', label: 'Lightning 2' },
		{ id: 'tv2', label: 'TV 2' },
		{ id: 'pulsing2', label: 'Pulsing 2' },
		{ id: 'strobe2', label: 'Strobe 2' },
		{ id: 'explosion2', label: 'Explosion 2' },
		{ id: 'fire2', label: 'Fire 2' },
		{ id: 'welding2', label: 'Welding 2' },
		{ id: 'cop_car2', label: 'Cop Car 2' },
		{ id: 'party_lights2', label: 'Party Lights 2' },
		{ id: 'one_pixel_chase', label: 'One Pixel Chase' },
		{ id: 'two_pixel_chase', label: 'Two Pixel Chase' },
		{ id: 'three_pixel_chase', label: 'Three Pixel Chase' },
		{ id: 'pixel_fire', label: 'Pixel Fire' },
		{ id: 'color_cycle', label: 'Color Cycle' },
		{ id: 'color_fade', label: 'Color Fade' },
		{ id: 'rainbow', label: 'Rainbow' }
	]

	return {
		// Power Control
		power_on: {
			name: 'Power On',
			description: 'Turn the light on',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				}
			],
			callback: async (action) => {
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'set_sleep',
					args: { sleep: false }
				})
			}
		},

		power_off: {
			name: 'Power Off',
			description: 'Turn the light off',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				}
			],
			callback: async (action) => {
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'set_sleep',
					args: { sleep: true }
				})
			}
		},

		power_toggle: {
			name: 'Power Toggle',
			description: 'Toggle the light on/off',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				}
			],
			callback: async (action) => {
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'toggle_sleep'
				})
			}
		},

		// Intensity Control
		set_intensity: {
			name: 'Set Intensity',
			description: 'Set the light intensity',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				},
				{
					type: 'number',
					id: 'intensity',
					label: 'Intensity (%)',
					default: 100,
					min: 0,
					max: 100,
					step: 1
				}
			],
			callback: async (action) => {
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'set_intensity',
					args: { intensity: action.options.intensity * 10 }
				})
			}
		},

		adjust_intensity: {
			name: 'Adjust Intensity',
			description: 'Increase or decrease intensity',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				},
				{
					type: 'number',
					id: 'delta',
					label: 'Delta (%)',
					default: 10,
					min: -100,
					max: 100,
					step: 1
				}
			],
			callback: async (action) => {
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'increase_intensity',
					args: { delta: action.options.delta * 10 }
				})
			}
		},

		// CCT Control
		set_cct: {
			name: 'Set CCT',
			description: 'Set the color temperature',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				},
				{
					type: 'number',
					id: 'cct',
					label: 'CCT (Kelvin)',
					default: 5600,
					min: 2000,
					max: 10000,
					step: 100
				},
				{
					type: 'checkbox',
					id: 'setIntensity',
					label: 'Also Set Intensity',
					default: false
				},
				{
					type: 'number',
					id: 'intensity',
					label: 'Intensity (%)',
					default: 100,
					min: 0,
					max: 100,
					step: 1,
					isVisible: (options) => options.setIntensity
				}
			],
			callback: async (action) => {
				const args = { cct: action.options.cct }
				if (action.options.setIntensity) {
					args.intensity = action.options.intensity * 10
				}
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'set_cct',
					args
				})
			}
		},

		adjust_cct: {
			name: 'Adjust CCT',
			description: 'Increase or decrease color temperature',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				},
				{
					type: 'number',
					id: 'delta',
					label: 'Delta (Kelvin)',
					default: 100,
					min: -1000,
					max: 1000,
					step: 100
				}
			],
			callback: async (action) => {
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'increase_cct',
					args: { delta: action.options.delta }
				})
			}
		},

		// HSI Control
		set_hsi: {
			name: 'Set HSI',
			description: 'Set hue, saturation, and intensity',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				},
				{
					type: 'number',
					id: 'hue',
					label: 'Hue (degrees)',
					default: 0,
					min: 0,
					max: 360,
					step: 1
				},
				{
					type: 'number',
					id: 'saturation',
					label: 'Saturation (%)',
					default: 100,
					min: 0,
					max: 100,
					step: 1
				},
				{
					type: 'number',
					id: 'intensity',
					label: 'Intensity (%)',
					default: 100,
					min: 0,
					max: 100,
					step: 1
				}
			],
			callback: async (action) => {
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'set_hsi',
					args: {
						hue: action.options.hue,
						sat: action.options.saturation,
						intensity: action.options.intensity * 10
					}
				})
			}
		},

		// RGB Control
		set_color: {
			name: 'Set RGB Color',
			description: 'Set the light color using hex color',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				},
				{
					type: 'textinput',
					id: 'color',
					label: 'Color (hex)',
					default: '#FF5500',
					regex: '/^#[0-9A-Fa-f]{6}$/'
				},
				{
					type: 'checkbox',
					id: 'setIntensity',
					label: 'Also Set Intensity',
					default: false
				},
				{
					type: 'number',
					id: 'intensity',
					label: 'Intensity (%)',
					default: 100,
					min: 0,
					max: 100,
					step: 1,
					isVisible: (options) => options.setIntensity
				}
			],
			callback: async (action) => {
				const args = { color: action.options.color }
				if (action.options.setIntensity) {
					args.intensity = action.options.intensity * 10
				}
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'set_color',
					args
				})
			}
		},

		// Effect Control
		set_effect: {
			name: 'Set Effect',
			description: 'Apply a lighting effect',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				},
				{
					type: 'dropdown',
					id: 'effect',
					label: 'Effect',
					default: 'strobe',
					choices: EFFECT_CHOICES
				},
				{
					type: 'checkbox',
					id: 'setIntensity',
					label: 'Also Set Intensity',
					default: false
				},
				{
					type: 'number',
					id: 'intensity',
					label: 'Intensity (%)',
					default: 100,
					min: 0,
					max: 100,
					step: 1,
					isVisible: (options) => options.setIntensity
				}
			],
			callback: async (action) => {
				const args = { effect_type: action.options.effect }
				if (action.options.setIntensity) {
					args.intensity = action.options.intensity * 10
				}
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'set_system_effect',
					args
				})
			}
		},

		// Quickshot
		apply_quickshot: {
			name: 'Apply Quickshot',
			description: 'Apply a saved quickshot/shortcut',
			options: [
				{
					type: 'dropdown',
					id: 'quickshotId',
					label: 'Quickshot',
					default: '',
					choices: instance.getQuickshotChoices()
				}
			],
			callback: async (action) => {
				instance.connection.sendRequest({
					action: 'set_quickshot',
					args: { quickshot_id: action.options.quickshotId }
				})
			}
		},

		// Preset
		apply_preset: {
			name: 'Apply Preset',
			description: 'Apply a saved preset',
			options: [
				{
					type: 'dropdown',
					id: 'device',
					label: 'Device',
					default: '',
					choices: instance.getDeviceChoices()
				},
				{
					type: 'dropdown',
					id: 'presetId',
					label: 'Preset',
					default: '',
					choices: instance.getPresetChoices()
				}
			],
			callback: async (action) => {
				instance.connection.sendRequest({
					node_id: action.options.device,
					action: 'set_preset',
					args: { preset_id: action.options.presetId }
				})
			}
		},

		// Refresh devices
		refresh_devices: {
			name: 'Refresh Devices',
			description: 'Refresh the device list from Amaran Desktop',
			options: [],
			callback: async () => {
				instance.refreshDevices()
			}
		}
	}
}
