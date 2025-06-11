import { useEffect, useRef } from 'react';
import { DeviceEventEmitter, NativeEventEmitter, Platform } from 'react-native';
import { AudioWaveform } from '../AudioWaveform';
import { NativeEvents, UpdateFrequency } from '../constants';
import type { IOnCurrentRecordingWaveForm } from '../types';

/**
 * Hook for managing live waveform data generation
 */
export const useLiveWaveform = () => {
  const eventEmitterRef = useRef<NativeEventEmitter | null>(null);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      eventEmitterRef.current = new NativeEventEmitter(AudioWaveform);
    }

    return () => {
      if (eventEmitterRef.current) {
        eventEmitterRef.current.removeAllListeners(NativeEvents.onCurrentRecordingWaveformData);
      }
    };
  }, []);

  /**
   * Starts generating live waveform data
   */
  const startLiveWaveform = async (updateFrequency: UpdateFrequency = UpdateFrequency.medium): Promise<boolean> => {
    try {
      return await AudioWaveform.startLiveWaveform(updateFrequency);
    } catch (error) {
      console.error('Error starting live waveform:', error);
      return false;
    }
  };

  /**
   * Stops generating live waveform data
   */
  const stopLiveWaveform = async (): Promise<boolean> => {
    try {
      return await AudioWaveform.stopLiveWaveform();
    } catch (error) {
      console.error('Error stopping live waveform:', error);
      return false;
    }
  };

  /**
   * Gets current decibel level
   */
  const getCurrentDecibel = async (): Promise<number> => {
    try {
      return await AudioWaveform.getCurrentDecibel();
    } catch (error) {
      console.error('Error getting current decibel:', error);
      return 0;
    }
  };

  /**
   * Subscribes to live waveform data updates
   */
  const onCurrentRecordingWaveformData = (callback: (data: IOnCurrentRecordingWaveForm) => void) => {
    const eventEmitter = Platform.OS === 'ios' ? eventEmitterRef.current : DeviceEventEmitter;
    
    if (eventEmitter) {
      const subscription = eventEmitter.addListener(
        NativeEvents.onCurrentRecordingWaveformData,
        callback
      );
      
      return subscription;
    }
    
    return { remove: () => {} };
  };

  return {
    startLiveWaveform,
    stopLiveWaveform,
    getCurrentDecibel,
    onCurrentRecordingWaveformData,
  };
};
