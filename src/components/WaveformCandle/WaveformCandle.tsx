import React from 'react';
import { View } from 'react-native';
import { Colors } from '../../theme';
import styles from './WaveformCandleStyles';
import type { IWaveformCandle } from './WaveformCandleTypes';

export const WaveformCandle: React.FC<IWaveformCandle> = ({
  index,
  amplitude,
  candleWidth,
  candleSpace,
  waveColor,
  candleHeightScale,
}) => {
  const maxHeight = 100; // Fixed height for live waveform

  const getWaveColor = () => {
    return {
      backgroundColor: waveColor ? waveColor : Colors.waveStickBackground,
    };
  };

  return (
    <View key={index} style={styles.candleContainer}>
      <View
        style={[
          getWaveColor(),
          {
            width: candleWidth,
            marginRight: candleSpace,
            maxHeight,
            height: Math.max(
              (isNaN(amplitude) ? 0 : amplitude) * maxHeight * candleHeightScale,
              candleWidth
            ),
            minHeight: candleWidth,
            borderRadius: candleWidth,
          },
        ]}
      />
    </View>
  );
};
