export function getFeedbacks(instance) {
	return {
		power_state: {
			type: 'boolean',
			name: 'Power State',
			description: 'Change style based on power state',
			defaultStyle: {
				bgcolor: 0x00ff00 // Green when on
			},
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
					id: 'state',
					label: 'State',
					default: 'on',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' }
					]
				}
			],
			callback: (feedback) => {
				const state = instance.getDeviceState(feedback.options.device)
				const isPowered = state.power === true
				return feedback.options.state === 'on' ? isPowered : !isPowered
			}
		},

		intensity_level: {
			type: 'boolean',
			name: 'Intensity Level',
			description: 'Change style based on intensity level',
			defaultStyle: {
				bgcolor: 0x0000ff
			},
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
					id: 'comparison',
					label: 'Comparison',
					default: 'gte',
					choices: [
						{ id: 'eq', label: 'Equal to' },
						{ id: 'lt', label: 'Less than' },
						{ id: 'lte', label: 'Less than or equal' },
						{ id: 'gt', label: 'Greater than' },
						{ id: 'gte', label: 'Greater than or equal' }
					]
				},
				{
					type: 'number',
					id: 'intensity',
					label: 'Intensity (%)',
					default: 50,
					min: 0,
					max: 100,
					step: 1
				}
			],
			callback: (feedback) => {
				const state = instance.getDeviceState(feedback.options.device)
				const intensity = state.intensity || 0
				const target = feedback.options.intensity

				switch (feedback.options.comparison) {
					case 'eq': return intensity === target
					case 'lt': return intensity < target
					case 'lte': return intensity <= target
					case 'gt': return intensity > target
					case 'gte': return intensity >= target
					default: return false
				}
			}
		},

		cct_range: {
			type: 'boolean',
			name: 'CCT Range',
			description: 'Change style based on color temperature',
			defaultStyle: {
				bgcolor: 0xffaa00
			},
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
					id: 'range',
					label: 'Temperature Range',
					default: 'daylight',
					choices: [
						{ id: 'warm', label: 'Warm (2000-3500K)' },
						{ id: 'neutral', label: 'Neutral (3500-5500K)' },
						{ id: 'daylight', label: 'Daylight (5500-6500K)' },
						{ id: 'cool', label: 'Cool (6500-10000K)' }
					]
				}
			],
			callback: (feedback) => {
				const state = instance.getDeviceState(feedback.options.device)
				const cct = state.cct || 5600

				switch (feedback.options.range) {
					case 'warm': return cct >= 2000 && cct < 3500
					case 'neutral': return cct >= 3500 && cct < 5500
					case 'daylight': return cct >= 5500 && cct < 6500
					case 'cool': return cct >= 6500 && cct <= 10000
					default: return false
				}
			}
		}
	}
}
