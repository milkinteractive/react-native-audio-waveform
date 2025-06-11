package com.audiowaveform

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
import java.io.File
import kotlin.math.log10

class AudioWaveformModule(context: ReactApplicationContext): ReactContextBaseJavaModule(context) {
    private var mediaRecorder: MediaRecorder? = null
    private var isRecording = false
    private val handler = Handler(Looper.getMainLooper())
    private var updateFrequency: UpdateFrequency = UpdateFrequency.Medium
    private var monitoringRunnable: Runnable? = null

    companion object {
        const val NAME = "AudioWaveform"
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
        val decibel = getDecibelLevel()
        promise.resolve(decibel)
    }

    private fun startAudioRecording() {
        // Create a temporary file for recording (we don't actually save it)
        val tempFile = File(reactApplicationContext.cacheDir, "temp_recording.m4a")

        mediaRecorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setAudioSamplingRate(44100)
            setOutputFile(tempFile.absolutePath)
            prepare()
            start()
        }

        startMonitoring()
    }

    private fun stopAudioRecording() {
        stopMonitoring()

        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
        } catch (e: Exception) {
            Log.e(NAME, "Error stopping MediaRecorder: ${e.message}")
        }

        mediaRecorder = null
        isRecording = false

        // Clean up temp file
        val tempFile = File(reactApplicationContext.cacheDir, "temp_recording.m4a")
        if (tempFile.exists()) {
            tempFile.delete()
        }
    }

    private fun startMonitoring() {
        monitoringRunnable = object : Runnable {
            override fun run() {
                if (isRecording) {
                    val decibel = getDecibelLevel()

                    val args: WritableMap = Arguments.createMap()
                    args.putDouble(Constants.currentDecibel, decibel)

                    reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit(Constants.onCurrentRecordingWaveformData, args)

                    handler.postDelayed(this, updateFrequency.value)
                }
            }
        }

        handler.post(monitoringRunnable!!)
    }

    private fun stopMonitoring() {
        monitoringRunnable?.let { handler.removeCallbacks(it) }
        monitoringRunnable = null
    }

    private fun getDecibelLevel(): Double {
        return try {
            val amplitude = mediaRecorder?.maxAmplitude?.toDouble() ?: 0.0
            // Convert to linear scale (0.0 to 1.0)
            amplitude / 32768.0
        } catch (e: Exception) {
            Log.e(NAME, "Error getting decibel level: ${e.message}")
            0.0
        }
    }
}