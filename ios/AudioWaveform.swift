//
//  AudioWaveforms.swift
//  Waveforms
//
//  Created by Viraj Patel on 12/09/23.
//

import UIKit
import AVFoundation

@objc(AudioWaveform)
class AudioWaveform: RCTEventEmitter {
  private var audioEngine: AVAudioEngine?
  private var inputNode: AVAudioInputNode?
  private var isGeneratingWaveform = false
  private var updateFrequency: UpdateFrequency = .medium

  override init() {
    super.init()
  }

  deinit {
    stopAudioEngine()
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  // we need to override this method and
  // return an array of event names that we can listen to
  override func supportedEvents() -> [String]! {
    return ["onCurrentRecordingWaveformData"]
  }
  
  @objc func startLiveWaveform(_ updateFreq: Double, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    guard !isGeneratingWaveform else {
      resolve(true) // Already running
      return
    }

    updateFrequency = UpdateFrequency(rawValue: updateFreq) ?? .medium

    do {
      try startAudioEngine()
      isGeneratingWaveform = true
      resolve(true)
    } catch {
      reject("AUDIO_ENGINE_ERROR", "Failed to start audio engine: \(error.localizedDescription)", error)
    }
  }

  @objc func stopLiveWaveform(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    stopAudioEngine()
    isGeneratingWaveform = false
    resolve(true)
  }

  @objc func getCurrentDecibel(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    // This would return the current decibel level if we were monitoring
    // For now, return 0 as a placeholder
    resolve(0.0)
  }
  
  // MARK: - Private Audio Engine Methods

  private func startAudioEngine() throws {
    audioEngine = AVAudioEngine()
    guard let audioEngine = audioEngine else { return }

    inputNode = audioEngine.inputNode
    guard let inputNode = inputNode else { return }

    let recordingFormat = inputNode.outputFormat(forBus: 0)

    inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] (buffer, time) in
      self?.processAudioBuffer(buffer)
    }

    try audioEngine.start()
  }

  private func stopAudioEngine() {
    audioEngine?.stop()
    inputNode?.removeTap(onBus: 0)
    audioEngine = nil
    inputNode = nil
  }

  private func processAudioBuffer(_ buffer: AVAudioPCMBuffer) {
    guard let channelData = buffer.floatChannelData?[0] else { return }

    let frameLength = Int(buffer.frameLength)
    var sum: Float = 0.0

    // Calculate RMS (Root Mean Square) for amplitude
    for i in 0..<frameLength {
      let sample = channelData[i]
      sum += sample * sample
    }

    let rms = sqrt(sum / Float(frameLength))
    let decibel = 20 * log10(rms + 0.0001) // Add small value to avoid log(0)

    // Normalize decibel to 0-1 range (assuming -60dB to 0dB range)
    let normalizedDecibel = max(0, min(1, (decibel + 60) / 60))

    // Send to React Native
    DispatchQueue.main.async { [weak self] in
      self?.sendEvent(withName: "onCurrentRecordingWaveformData", body: [
        "currentDecibel": normalizedDecibel
      ])
    }
  }
  
}
