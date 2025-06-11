import {
  IWaveformRef,
  UpdateFrequency,
  Waveform,
} from '@milkinteractive/react-native-audio-waveform';
import React, {
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import stylesheet from './styles';
import { Colors } from './theme';

const LivePlayerComponent = () => {
  const ref = useRef<IWaveformRef>(null);
  const [isActive, setIsActive] = useState(false);
  const styles = stylesheet();

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
    <View style={styles.liveWaveformContainer}>
      <Waveform
        mode="live"
        containerStyle={styles.liveWaveformView}
        ref={ref}
        candleSpace={2}
        candleWidth={4}
        waveColor={Colors.pink}
        updateFrequency={UpdateFrequency.medium}
        onWaveformData={(decibel) => {
          console.log('Current decibel:', decibel);
        }}
      />
      <Pressable
        onPress={handleWaveformAction}
        style={styles.recordAudioPressable}>
        <Text style={styles.buttonText}>
          {isActive ? 'Stop' : 'Start'} Live Waveform
        </Text>
      </Pressable>
    </View>
  );
};

const AppContainer = () => {
  const { top, bottom } = useSafeAreaInsets();
  const styles = stylesheet({ top, bottom });

  return (
    <View style={styles.appContainer}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={'transparent'}
        animated
        translucent
      />
      <GestureHandlerRootView style={styles.appContainer}>
        <View style={styles.screenBackground}>
          <View style={styles.container}>
            <Text style={styles.title}>Live Waveform Demo</Text>
            <Text style={styles.subtitle}>
              This demo shows only the live waveform visualization without audio recording or playback.
            </Text>
          </View>
          <LivePlayerComponent />
        </View>
      </GestureHandlerRootView>
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AppContainer />
    </SafeAreaProvider>
  );
};

export default App;
