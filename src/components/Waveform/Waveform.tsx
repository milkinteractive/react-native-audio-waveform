import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ScrollView,
  View,
} from 'react-native';
import { UpdateFrequency } from '../../constants';
import { useLiveWaveform } from '../../hooks';
import { WaveformCandle } from '../WaveformCandle';
import styles from './WaveformStyles';
import {
  type IWaveform,
  type IWaveformRef,
} from './WaveformTypes';

export const Waveform = forwardRef<IWaveformRef, IWaveform>((props, ref) => {
  const {
    maxCandlesToRender = 300,
    candleSpace = 2,
    candleWidth = 5,
    containerStyle = {},
    waveColor = '#545454',
    candleHeightScale = 3,
    showsHorizontalScrollIndicator = false,
    updateFrequency = UpdateFrequency.medium,
    onWaveformData,
  } = props;

  const scrollRef = useRef<ScrollView>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(false);

  const {
    startLiveWaveform,
    stopLiveWaveform,
    getCurrentDecibel,
    onCurrentRecordingWaveformData,
  } = useLiveWaveform();

  // Start live waveform generation
  const startLiveWaveformGeneration = async (): Promise<boolean> => {
    try {
      const result = await startLiveWaveform(updateFrequency);
      setIsActive(result);
      return result;
    } catch (error) {
      console.error('Error starting live waveform:', error);
      return false;
    }
  };

  // Stop live waveform generation
  const stopLiveWaveformGeneration = async (): Promise<boolean> => {
    try {
      const result = await stopLiveWaveform();
      setIsActive(false);
      setWaveform([]);
      return result;
    } catch (error) {
      console.error('Error stopping live waveform:', error);
      return false;
    }
  };

  // Get current decibel level
  const getDecibelLevel = async (): Promise<number> => {
    try {
      return await getCurrentDecibel();
    } catch (error) {
      console.error('Error getting decibel level:', error);
      return 0;
    }
  };

  // Subscribe to live waveform data
  useEffect(() => {
    const subscription = onCurrentRecordingWaveformData((result) => {
      if (result.currentDecibel !== undefined) {
        setWaveform((previousWaveform: number[]) => {
          // Add the new decibel to the waveform
          const updatedWaveform: number[] = [
            ...previousWaveform,
            result.currentDecibel,
          ];

          // Limit the size of the waveform array to 'maxCandlesToRender'
          const finalWaveform = updatedWaveform.length > maxCandlesToRender
            ? updatedWaveform.slice(1)
            : updatedWaveform;

          // Auto-scroll to end
          if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
          }

          // Call callback if provided
          if (onWaveformData) {
            onWaveformData(result.currentDecibel);
          }

          return finalWaveform;
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [maxCandlesToRender, onWaveformData, onCurrentRecordingWaveformData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopLiveWaveformGeneration();
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    startLiveWaveform: startLiveWaveformGeneration,
    stopLiveWaveform: stopLiveWaveformGeneration,
    getCurrentDecibel: getDecibelLevel,
  }));

  return (
    <View style={[styles.waveformContainer, containerStyle]}>
      <View style={styles.waveformInnerContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
          ref={scrollRef}
          style={styles.scrollContainer}
          scrollEnabled={true}>
          {waveform?.map?.((amplitude, indexCandle) => (
            <WaveformCandle
              key={indexCandle}
              index={indexCandle}
              amplitude={amplitude}
              candleWidth={candleWidth}
              candleSpace={candleSpace}
              waveColor={waveColor}
              candleHeightScale={candleHeightScale}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
});
