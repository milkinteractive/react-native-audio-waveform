//
//  AudioWaveform.swift
//  Waveforms
//
//  Created by Viraj Patel on 12/09/23.
//

import UIKit
import AVFoundation

@objc(AudioWaveform)
class AudioWaveform: RCTEventEmitter, AVAudioRecorderDelegate {
  private var audioRecorder: AVAudioRecorder?
  private var isGeneratingWaveform = false
  private var updateFrequency: UpdateFrequency = .medium
  private var timer: Timer?

  override init() {
    super.init()
  }

  deinit {
    stopAudioRecording()
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func constantsToExport() -> [AnyHashable : Any]! {
    return [:]
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
      try startAudioRecording()
      isGeneratingWaveform = true
      resolve(true)
    } catch {
      reject("AUDIO_RECORDER_ERROR", "Failed to start audio recording: \(error.localizedDescription)", error)
    }
  }

  @objc func stopLiveWaveform(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    stopAudioRecording()
    isGeneratingWaveform = false
    resolve(true)
  }

  @objc func getCurrentDecibel(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    let decibel = getDecibelLevel()
    resolve(decibel)
  }
  
  // MARK: - Private Audio Recording Methods

  private func startAudioRecording() throws {
    let settings = [
      AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
      AVSampleRateKey: 44100,
      AVNumberOfChannelsKey: 1,
      AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
    ]
    
    let options: AVAudioSession.CategoryOptions = [.defaultToSpeaker, .allowBluetooth, .mixWithOthers]
    
    // Create a temporary URL for recording (we don't actually save the file)
    let tempDir = FileManager.default.temporaryDirectory
    let tempURL = tempDir.appendingPathComponent("temp_recording.m4a")
    
    do {
      try AVAudioSession.sharedInstance().setCategory(AVAudioSession.Category.playAndRecord, options: options)
      try AVAudioSession.sharedInstance().setActive(true)
      
      audioRecorder = try AVAudioRecorder(url: tempURL, settings: settings)
      audioRecorder?.delegate = self
      audioRecorder?.isMeteringEnabled = true
      audioRecorder?.record()
      
      startListening()
    } catch {
      throw error
    }
  }

  private func stopAudioRecording() {
    stopListening()
    audioRecorder?.stop()
    audioRecorder = nil
    
    // Deactivate audio session
    do {
      try AVAudioSession.sharedInstance().setActive(false)
    } catch {
      print("Failed to deactivate audio session: \(error)")
    }
  }
  
  @objc private func timerUpdate(_ sender: Timer) {
    if audioRecorder?.isRecording == true {
      sendEvent(withName: "onCurrentRecordingWaveformData", body: [
        "currentDecibel": getDecibelLevel()
      ])
    }
  }
  
  private func startListening() {
    stopListening()
    DispatchQueue.main.async { [weak self] in
      guard let strongSelf = self else { return }
      strongSelf.timer = Timer.scheduledTimer(
        timeInterval: TimeInterval(Float(strongSelf.updateFrequency.rawValue) / 1000),
        target: strongSelf,
        selector: #selector(strongSelf.timerUpdate(_:)),
        userInfo: nil,
        repeats: true
      )
    }
  }
  
  private func stopListening() {
    timer?.invalidate()
    timer = nil
  }
  
  private func getDecibelLevel() -> Float {
    audioRecorder?.updateMeters()
    let amp = audioRecorder?.peakPower(forChannel: 0) ?? 0.0
    let linear = pow(10, amp / 20)
    return linear
  }
}
