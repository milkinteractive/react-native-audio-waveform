import type { NativeModule } from 'react-native';
import type { UpdateFrequency } from '../constants';

export interface IOnCurrentRecordingWaveForm {
  currentDecibel: number;
}

/**
 * Represents the interface for the AudioWaveforms module.
 */
export interface IAudioWaveforms extends NativeModule {
  /**
   * Starts generating live waveform data.
   * @param updateFrequency - How often to update the waveform data.
   * @returns A promise that resolves to a boolean indicating if the waveform generation started successfully.
   */
  startLiveWaveform(updateFrequency?: UpdateFrequency): Promise<boolean>;

  /**
   * Stops generating live waveform data.
   * @returns A promise that resolves to a boolean indicating if the waveform generation was stopped successfully.
   */
  stopLiveWaveform(): Promise<boolean>;

  /**
   * Gets the current decibel level for live waveform.
   * @returns A promise that resolves to the decibel level.
   */
  getCurrentDecibel(): Promise<number>;
}
