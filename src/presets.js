export function getPresets(instance) {
	const presets = {}

	// Note: In a real implementation, you'd dynamically generate presets
	// based on discovered devices. This is a template showing the structure.

	// Power toggle preset template
	presets['power_toggle'] = {
		type: 'button',
		category: 'Power Control',
		name: 'Power Toggle',
		style: {
			text: 'Power\\nToggle',
			size: '14',
			color: 0xffffff,
			bgcolor: 0x000000
		},
		steps: [
			{
				down: [
					{
						actionId: 'power_toggle',
						options: {
							device: ''
						}
					}
				],
				up: []
			}
		],
		feedbacks: [
			{
				feedbackId: 'power_state',
				options: {
					device: '',
					state: 'on'
				},
				style: {
					bgcolor: 0x00ff00
				}
			}
		]
	}

	// Common CCT presets
	const cctPresets = [
		{ name: 'Tungsten', cct: 3200, color: 0xff9500 },
		{ name: 'Daylight', cct: 5600, color: 0xfff4e6 },
		{ name: 'Cool White', cct: 6500, color: 0xe6f0ff }
	]

	cctPresets.forEach(preset => {
		presets[`cct_${preset.cct}`] = {
			type: 'button',
			category: 'CCT Presets',
			name: preset.name,
			style: {
				text: `${preset.name}\\n${preset.cct}K`,
				size: '14',
				color: 0x000000,
				bgcolor: preset.color
			},
			steps: [
				{
					down: [
						{
							actionId: 'set_cct',
							options: {
								device: '',
								cct: preset.cct,
								setIntensity: false,
								intensity: 100
							}
						}
					],
					up: []
				}
			],
			feedbacks: []
		}
	})

	// Intensity presets
	const intensityPresets = [0, 25, 50, 75, 100]
	intensityPresets.forEach(intensity => {
		const brightness = Math.floor((intensity / 100) * 255)
		presets[`intensity_${intensity}`] = {
			type: 'button',
			category: 'Intensity',
			name: `${intensity}%`,
			style: {
				text: `${intensity}%`,
				size: '18',
				color: intensity > 50 ? 0x000000 : 0xffffff,
				bgcolor: (brightness << 16) | (brightness << 8) | brightness
			},
			steps: [
				{
					down: [
						{
							actionId: 'set_intensity',
							options: {
								device: '',
								intensity: intensity
							}
						}
					],
					up: []
				}
			],
			feedbacks: []
		}
	})

	// Common effects
	const effectPresets = [
		{ id: 'strobe', name: 'Strobe', color: 0xff0000 },
		{ id: 'fire', name: 'Fire', color: 0xff6600 },
		{ id: 'lightning', name: 'Lightning', color: 0x00ffff },
		{ id: 'cop_car', name: 'Cop Car', color: 0x0066ff },
		{ id: 'candle', name: 'Candle', color: 0xff9900 },
		{ id: 'tv', name: 'TV Flicker', color: 0x3366ff },
		{ id: 'paparazzi', name: 'Paparazzi', color: 0xffffff }
	]

	effectPresets.forEach(effect => {
		presets[`effect_${effect.id}`] = {
			type: 'button',
			category: 'Effects',
			name: effect.name,
			style: {
				text: effect.name,
				size: '14',
				color: 0xffffff,
				bgcolor: effect.color
			},
			steps: [
				{
					down: [
						{
							actionId: 'set_effect',
							options: {
								device: '',
								effect: effect.id,
								setIntensity: false,
								intensity: 100
							}
						}
					],
					up: []
				}
			],
			feedbacks: []
		}
	})

	// Common color presets
	const colorPresets = [
		{ name: 'Red', color: '#FF0000' },
		{ name: 'Orange', color: '#FF6600' },
		{ name: 'Yellow', color: '#FFFF00' },
		{ name: 'Green', color: '#00FF00' },
		{ name: 'Cyan', color: '#00FFFF' },
		{ name: 'Blue', color: '#0000FF' },
		{ name: 'Purple', color: '#9900FF' },
		{ name: 'Magenta', color: '#FF00FF' },
		{ name: 'Pink', color: '#FF6699' }
	]

	colorPresets.forEach(preset => {
		const hexNum = parseInt(preset.color.slice(1), 16)
		presets[`color_${preset.name.toLowerCase()}`] = {
			type: 'button',
			category: 'Colors',
			name: preset.name,
			style: {
				text: preset.name,
				size: '14',
				color: 0xffffff,
				bgcolor: hexNum
			},
			steps: [
				{
					down: [
						{
							actionId: 'set_color',
							options: {
								device: '',
								color: preset.color,
								setIntensity: false,
								intensity: 100
							}
						}
					],
					up: []
				}
			],
			feedbacks: []
		}
	})

	return presets
}
