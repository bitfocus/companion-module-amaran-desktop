import assert from 'node:assert/strict'
import test from 'node:test'

import { getDeviceVariableValues } from '../src/variables.js'

test('maps a device state to its declared Companion variables', () => {
	const values = getDeviceVariableValues(
		{ node_id: 'node-7', name: 'Key Light 1' },
		{ power: true, intensity: 72, cct: 5600 },
	)

	assert.deepEqual(values, {
		Key_Light_1_power: 'ON',
		Key_Light_1_intensity: 72,
		Key_Light_1_cct: 5600,
	})
})

test('does not overwrite values that have not yet been reported', () => {
	const values = getDeviceVariableValues({ node_id: 'node-7', name: 'Key Light 1' }, { intensity: 10 })

	assert.deepEqual(values, { Key_Light_1_intensity: 10 })
})
