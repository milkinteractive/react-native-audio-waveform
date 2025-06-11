package com.audiowaveform

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.log10
import kotlin.math.sqrt

class AudioWaveformModule(context: ReactApplicationContext): ReactContextBaseJavaModule(context) {
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private val handler = Handler(Looper.getMainLooper())
    private var updateFrequency: UpdateFrequency = UpdateFrequency.Medium
    private var recordingThread: Thread? = null

    companion object {
        const val NAME = "AudioWaveform"
        private const val SAMPLE_RATE = 44100
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val BUFFER_SIZE_FACTOR = 2
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun startLiveWaveform(updateFreq: Double, promise: Promise) {
        if (isRecording) {
            promise.resolve(true) // Already running
            return
        }

        updateFrequency = when (updateFreq.toLong()) {
            250L -> UpdateFrequency.High
            500L -> UpdateFrequency.Medium
            1000L -> UpdateFrequency.Low
            else -> UpdateFrequency.Medium
        }

        try {
            startAudioRecording()
            isRecording = true
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(NAME, "Failed to start live waveform: ${e.message}")
            promise.reject("AUDIO_RECORD_ERROR", "Failed to start audio recording: ${e.message}")
        }
    }

    @ReactMethod
    fun stopLiveWaveform(promise: Promise) {
        stopAudioRecording()
        isRecording = false
        promise.resolve(true)
    }

    @ReactMethod
    fun getCurrentDecibel(promise: Promise) {
        // This would return the current decibel level if we were monitoring
        // For now, return 0 as a placeholder
        promise.resolve(0.0)
    }

    private fun startAudioRecording() {
        val bufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT) * BUFFER_SIZE_FACTOR

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            SAMPLE_RATE,
            CHANNEL_CONFIG,
            AUDIO_FORMAT,
            bufferSize
        )

        audioRecord?.startRecording()

        recordingThread = Thread {
            processAudioData(bufferSize)
        }
        recordingThread?.start()
    }

    private fun stopAudioRecording() {
        isRecording = false
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
        recordingThread?.interrupt()
        recordingThread = null
    }

    private fun processAudioData(bufferSize: Int) {
        val buffer = ShortArray(bufferSize)

        while (isRecording && audioRecord?.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
            val readSize = audioRecord?.read(buffer, 0, bufferSize) ?: 0

            if (readSize > 0) {
                // Calculate RMS (Root Mean Square) for amplitude
                var sum = 0.0
                for (i in 0 until readSize) {
                    val sample = buffer[i].toDouble() / Short.MAX_VALUE
                    sum += sample * sample
                }

                val rms = sqrt(sum / readSize)
                val decibel = 20 * log10(rms + 0.0001) // Add small value to avoid log(0)

                // Normalize decibel to 0-1 range (assuming -60dB to 0dB range)
                val normalizedDecibel = maxOf(0.0, minOf(1.0, (decibel + 60) / 60))

                // Send to React Native
                handler.post {
                    val args: WritableMap = Arguments.createMap()
                    args.putDouble("currentDecibel", normalizedDecibel)
                    reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit("onCurrentRecordingWaveformData", args)
                }
            }

            // Sleep based on update frequency
            try {
                Thread.sleep(updateFrequency.value)
            } catch (e: InterruptedException) {
                break
            }
        }
    }
}