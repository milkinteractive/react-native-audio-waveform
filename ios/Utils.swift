//
//  Utils.swift
//  Waveforms
//
//  Created by Viraj Patel on 12/09/23.
//

import Foundation

struct Constants {
  static let audioWaveforms = "AudioWaveforms"
  static let currentDecibel = "currentDecibel"
  static let onCurrentRecordingWaveformData = "onCurrentRecordingWaveformData"
  static let waveformData = "waveformData"
  static let updateFrequency = "updateFrequency"
}



//Note: If you are making change here, please make sure to make change in Android and React Native side as well other wise there will be mismatch in value
//Use same values in Android and React native side as well
enum UpdateFrequency : Double {
    case high = 250.0
  case medium = 500.0
  case low = 1000.0
}
/// Creates an 2D array of floats
public typealias FloatChannelData = [[Float]]

/// Extension to fill array with zeros
public extension RangeReplaceableCollection where Iterator.Element: ExpressibleByIntegerLiteral {
  init(zeros count: Int) {
    self.init(repeating: 0, count: count)
  }
}
