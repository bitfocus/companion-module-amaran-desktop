# companion-module-amaran-desktop

This module allows control of the Amaran Desktop application from Bitfocus Companion.

It operates entirely locally and connects to a WebSockets API exposed by the Amaran Desktop application. It does not require a Amaran OpenAPI key.

## Requirements

- Bitfocus Companion v4.0 or later
- Amaran Desktop application running on the same computer as the Companion app
- Amaran lights connected to the Amaran Desktop app (via Bluetooth)

## Features

### Actions

- **Power Control**
  - Power On
  - Power Off
  - Power Toggle

- **Intensity Control**
  - Set Intensity (0-100%)
  - Adjust Intensity (+/- delta)

- **CCT Control**
  - Set CCT (2000-10000K)
  - Adjust CCT (+/- delta)

- **HSI Control**
  - Set Hue (0-360°)
  - Set Saturation (0-100%)
  - Set Intensity (0-100%)

- **RGB Control**
  - Set Color (hex color)

- **Effects**
  - 30+ built-in effects (Strobe, Fire, Lightning, Cop Car, etc.)

- **Presets & Quickshots**
  - Apply saved presets
  - Apply saved quickshots/shortcuts

### Feedbacks

- Power State (on/off)
- Intensity Level (with comparisons)
- CCT Range (warm/neutral/daylight/cool)

### Variables

For each discovered device:
- `{device}_power` - Power state
- `{device}_intensity` - Current intensity %
- `{device}_cct` - Current CCT in Kelvin

## Configuration

1. Ensure Amaran Desktop is running and your lights are connected
2. Add the "Amaran Desktop" module in Companion
3. The default settings (localhost:33782) should work automatically
4. If lights, scenes, shortcuts, etc. are added or removed then use the "Refresh Devices" action to refresh these items (or reload the module by disabling and then re-enabling the module)

## License

MIT