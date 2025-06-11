# react-native-audio-waveform

A React Native component for live audio waveform visualization

[![react-native-audio-waveform on npm](https://img.shields.io/npm/v/@milkinteractive/react-native-audio-waveform.svg?&logo=npm&logoColor=white&color=red&labelColor=grey&cacheSeconds=3600&maxAge=86400)](https://www.npmjs.com/package/@milkinteractive/react-native-audio-waveform) [![Android](https://img.shields.io/badge/Platform-Android-green?logo=android&logoColor=white&labelColor=grey)](https://www.android.com) [![iOS](https://img.shields.io/badge/Platform-iOS-green?logo=apple&logoColor=white&labelColor=grey)](https://developer.apple.com/ios) [![MIT](https://img.shields.io/badge/License-MIT-green&labelColor=grey)](https://opensource.org/licenses/MIT)

> **Note**: This is a simplified fork of [@simform_solutions/react-native-audio-waveform](https://github.com/SimformSolutionsPvtLtd/react-native-audio-waveform) that focuses exclusively on **live waveform visualization**. All audio recording, playback, and file processing features have been removed to create a minimal, lightweight library for real-time audio visualization only.

---

A lightweight React Native package for generating live audio waveform visualizations in real-time. This simplified version focuses solely on waveform visualization without audio recording or playback functionality.

---

## Features

- Generate live waveform visualization in real time
- Customizable waveform appearance (color, width, spacing, height scale)
- Configurable update frequency (high, medium, low)
- Real-time decibel level monitoring
- Lightweight and minimal - no audio recording or playback functionality
- Cross-platform support (iOS & Android)
- TypeScript support

## Quick Access

- [Installation](#installation)
- [Usage](#usage)
- [Properties](#properties)
- [Example](#example)
- [License](#license)

## Installation

```bash
npm install @milkinteractive/react-native-audio-waveform
```

### iOS Setup

```bash
cd ios && pod install
```

### Android Setup

No additional setup required for Android.

## Usage

```tsx
import React, { useRef } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Waveform, IWaveformRef, UpdateFrequency } from '@milkinteractive/react-native-audio-waveform';

const LiveWaveformExample = () => {
  const ref = useRef<IWaveformRef>(null);
  const [isActive, setIsActive] = useState(false);

  const handleWaveformAction = async () => {
    if (isActive) {
      await ref.current?.stopLiveWaveform();
      setIsActive(false);
    } else {
      const result = await ref.current?.startLiveWaveform(UpdateFrequency.medium);
      setIsActive(result || false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Waveform
        mode="live"
        ref={ref}
        candleSpace={2}
        candleWidth={4}
        waveColor="#FF6B6B"
        updateFrequency={UpdateFrequency.medium}
        onWaveformData={(decibel) => {
          console.log('Current decibel:', decibel);
        }}
      />
      <Pressable onPress={handleWaveformAction}>
        <Text>{isActive ? 'Stop' : 'Start'} Live Waveform</Text>
      </Pressable>
    </View>
  );
};
```

## Properties

### Waveform Component Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `mode` | `'live'` | Required | Mode of the waveform (only live mode supported) |
| `ref` | `IWaveformRef` | Required | Reference to control the waveform |
| `candleSpace` | `number` | `2` | Space between waveform bars |
| `candleWidth` | `number` | `5` | Width of each waveform bar |
| `candleHeightScale` | `number` | `3` | Height scale multiplier for waveform bars |
| `waveColor` | `string` | `'#545454'` | Color of the waveform bars |
| `containerStyle` | `StyleProp<ViewStyle>` | `{}` | Style for the waveform container |
| `showsHorizontalScrollIndicator` | `boolean` | `false` | Show/hide horizontal scroll indicator |
| `maxCandlesToRender` | `number` | `300` | Maximum number of bars to render |
| `updateFrequency` | `UpdateFrequency` | `UpdateFrequency.medium` | How often to update the waveform |
| `onWaveformData` | `(decibel: number) => void` | `undefined` | Callback for waveform data updates |

### IWaveformRef Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `startLiveWaveform` | `updateFrequency?: UpdateFrequency` | `Promise<boolean>` | Start generating live waveform |
| `stopLiveWaveform` | - | `Promise<boolean>` | Stop generating live waveform |
| `getCurrentDecibel` | - | `Promise<number>` | Get current decibel level |

### UpdateFrequency Enum

| Value | Milliseconds | Description |
|-------|--------------|-------------|
| `UpdateFrequency.high` | 250 | High frequency updates |
| `UpdateFrequency.medium` | 500 | Medium frequency updates |
| `UpdateFrequency.low` | 1000 | Low frequency updates |

## Example

Check out the example app in the `example/` directory for a complete implementation.

## Differences from Original

This fork differs from the original [@simform_solutions/react-native-audio-waveform](https://github.com/SimformSolutionsPvtLtd/react-native-audio-waveform) in the following ways:

### ✅ **Kept Features:**
- Live waveform visualization
- Real-time audio level monitoring
- Customizable waveform appearance
- Cross-platform support (iOS & Android)
- TypeScript support

### ❌ **Removed Features:**
- Audio recording functionality
- Audio playback functionality
- Static waveform from audio files
- Audio file processing
- Permission handling
- Player controls (play, pause, stop, seek)
- Speed control
- All audio file dependencies

### 🎯 **Why This Fork?**
This simplified version is perfect for applications that only need **live audio visualization** without the overhead of full audio recording/playback capabilities. It results in a much smaller bundle size and fewer dependencies.

## License

MIT

---

## Find this library useful? ❤️

Support it by joining [stargazers](https://github.com/milkinteractive/react-native-audio-waveform/stargazers) for this repository. ⭐

## Bugs and Feedback

For bugs, feature requests, and discussion please use [GitHub Issues](https://github.com/milkinteractive/react-native-audio-waveform/issues).

## Made with ❤️ at Milk Interactive

[<img src="https://github.com/SimformSolutionsPvtLtd/Simform/blob/master/Assets/simform_logo.png" width="300">](https://simform.com/)
