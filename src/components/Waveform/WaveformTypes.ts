import type { StyleProp, ViewStyle } from 'react-native';
import type { UpdateFrequency } from '../../constants';

export interface IWaveformRef {
  startLiveWaveform: (updateFrequency?: UpdateFrequency) => Promise<boolean>;
  stopLiveWaveform: () => Promise<boolean>;
  getCurrentDecibel: () => Promise<number>;
}

export interface IWaveform {
  mode: 'live';
  maxCandlesToRender?: number;
  candleSpace?: number;
  candleWidth?: number;
  candleHeightScale?: number;
  containerStyle?: StyleProp<ViewStyle>;
  waveColor?: string;
  showsHorizontalScrollIndicator?: boolean;
  updateFrequency?: UpdateFrequency;
  onWaveformData?: (decibel: number) => void;
}
