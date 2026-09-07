export function getDeviceVariablePrefix(device) {
	return device.name?.replace(/[^a-zA-Z0-9]/g, '_') || device.node_id
}

export function getDeviceVariableValues(device, state) {
	const prefix = getDeviceVariablePrefix(device)
	const values = {}

	if (state.power !== undefined) {
		values[`${prefix}_power`] = state.power ? 'ON' : 'OFF'
	}
	if (state.intensity !== undefined) {
		values[`${prefix}_intensity`] = state.intensity
	}
	if (state.cct !== undefined) {
		values[`${prefix}_cct`] = state.cct
	}

	return values
}
