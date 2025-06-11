package com.audiowaveform

object Constants {
    const val LOG_TAG = "AudioWaveforms"
    const val onCurrentRecordingWaveformData = "onCurrentRecordingWaveformData"
    const val waveformData = "waveformData"
    const val updateFrequency = "updateFrequency"
    const val currentDecibel = "currentDecibel"
}

enum class UpdateFrequency(val value:Long) {
    High(250),
    Medium(500),
    Low(1000),
}