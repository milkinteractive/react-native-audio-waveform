//
//  AudioWaveforms.m
//  Waveforms
//
//  Created by Viraj Patel on 12/09/23.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(AudioWaveform, RCTEventEmitter)

RCT_EXTERN_METHOD(startLiveWaveform:(double)updateFreq
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopLiveWaveform:(RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getCurrentDecibel:(RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)

@end
