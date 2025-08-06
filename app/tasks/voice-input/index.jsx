import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder
} from 'expo-audio';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

// Custom Header Component
const CustomHeader = () => (
  <View className="px-6 pt-4 pb-5 border-b border-gray-100">
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-xl font-bold text-gray-900">Voice Input</Text>
        <Text className="text-sm text-gray-500 mt-1">Record your task description</Text>
      </View>
      <View className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl items-center justify-center">
        <Ionicons name="mic" size={24} color="white" />
      </View>
    </View>
  </View>
);

export default function VoiceInput() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer();

  const [modalVisible, setModalVisible] = useState(true);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isPrepared, setIsPrepared] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const timerRef = useRef(null);
  const playbackTimerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Permission Required', 'Please grant microphone access to record voice tasks');
          setIsPermissionGranted(false);
        } else {
          await setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: true
          });
          setIsPermissionGranted(true);
        }
      } catch (error) {
        console.error('Permission error:', error);
        setIsPermissionGranted(false);
      }
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (player.playing && player.currentTime !== undefined) {
      playbackTimerRef.current = setInterval(() => {
        setPlaybackTime(Math.floor(player.currentTime || 0));
      }, 100);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [player.playing, player.currentTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!isPermissionGranted) {
      Alert.alert('Permission Error', 'Microphone permission is required');
      return;
    }

    try {
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);

      await recorder.prepareToRecordAsync();
      setIsPrepared(true);
      recorder.record();

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsPrepared(false);
    }
  };

  const stopRecording = async () => {
    if (!isPrepared || !recorder.isRecording) return;

    try {
      await recorder.stop();
      setRecordingUri(recorder.uri);
      setIsPrepared(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setDuration(recordingTime);
      setPlaybackTime(0);

    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsPrepared(false);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) {
      Alert.alert('Error', 'No recording found');
      return;
    }

    try {
      if (player.playing) {
        await player.pause();
      } else {
        await player.replace({ uri: recordingUri });
        player.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const stopPlayback = async () => {
    if (player.playing) {
      await player.pause();
      setPlaybackTime(0);
    }
  };

  const uploadRecording = async () => {
    if (!recordingUri) {
      Alert.alert('Error', 'No recording found');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      console.log('Recording successful! File URI:', recordingUri);
      setIsUploading(false);
      Alert.alert('Success', 'Voice task created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            router.back();
          }
        }
      ]);
    }, 2000);
  };

  const resetRecording = async () => {
    try {
      if (player.playing) await player.pause();
      if (recorder.isRecording) await recorder.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }

      setIsPrepared(false);
      setRecordingTime(0);
      setPlaybackTime(0);
      setDuration(0);
      setRecordingUri(null);
    } catch (error) {
      console.error('Reset error:', error);
      Alert.alert('Error', 'Failed to reset recording');
    }
  };

  const handleRecordPress = () => {
    if (recorder.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    router.back();
  };

  const getRecordButtonStyle = () => {
    if (!isPermissionGranted || (recordingUri && !recorder.isRecording)) {
      return 'bg-gray-200 shadow-sm';
    }
    if (recorder.isRecording) {
      return 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25';
    }
    return 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25';
  };

  return (
    <BottomSheet 
      visible={modalVisible}
      onClose={handleModalClose}
      header={<CustomHeader />}
      heightRatio={0.75}
    >
      <View className="px-6 py-6 flex-1">
        {!isPermissionGranted && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="warning" size={20} color="#dc2626" />
              <Text className="text-red-700 font-medium ml-3 flex-1">
                Microphone permission required
              </Text>
            </View>
            <Text className="text-red-600 text-sm mt-2 ml-8">
              Please enable microphone access in your device settings
            </Text>
          </View>
        )}

        {/* Recording Timer Display */}
        {(recorder.isRecording || recordingTime > 0) && (
          <View className="items-center mb-8">
            <View className="bg-gray-50 rounded-3xl px-8 py-4 border border-gray-100">
              <Text className="text-4xl font-bold text-gray-800 font-mono tracking-wide">
                {formatTime(recordingTime)}
              </Text>
              <View className="flex-row items-center justify-center mt-2">
                {recorder.isRecording && (
                  <View className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
                )}
                <Text className="text-sm text-gray-500 font-medium">
                  {recorder.isRecording ? 'Recording in progress' : 'Recording complete'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Record Button */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={handleRecordPress}
            disabled={!isPermissionGranted || (!!recordingUri && !recorder.isRecording)}
            className={`w-32 h-32 rounded-full justify-center items-center ${getRecordButtonStyle()}`}
            style={{
              transform: [{ scale: recorder.isRecording ? 0.95 : 1 }]
            }}
          >
            <Ionicons
              name={recorder.isRecording ? 'stop' : 'mic'}
              size={48}
              color={!isPermissionGranted || (recordingUri && !recorder.isRecording) ? '#9ca3af' : 'white'}
            />
          </TouchableOpacity>
          
          <Text className="text-gray-600 text-base text-center mt-4 px-4">
            {!isPermissionGranted
              ? 'Grant microphone access to continue'
              : recorder.isRecording
              ? 'Recording your voice... Tap to stop'
              : recordingUri
              ? 'Recording ready for review'
              : 'Tap the microphone to start recording'}
          </Text>
        </View>

        {/* Playback Controls */}
        {recordingUri && (
          <View className="bg-gray-50 rounded-3xl p-6 mb-6 border border-gray-100">
            {/* Playback Info */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm font-mono text-gray-700 bg-white px-3 py-2 rounded-lg">
                {formatTime(playbackTime)}
              </Text>
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full mr-2 ${player.playing ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                <Text className="text-sm font-medium text-gray-600">
                  {player.playing ? 'Playing' : 'Paused'}
                </Text>
              </View>
              <Text className="text-sm font-mono text-gray-700 bg-white px-3 py-2 rounded-lg">
                {formatTime(duration)}
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="w-full h-2 bg-gray-200 rounded-full mb-6">
              <View
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                style={{
                  width: duration > 0 ? `${(playbackTime / duration) * 100}%` : '0%'
                }}
              />
            </View>

            {/* Control Buttons */}
            <View className="flex-row justify-center items-center space-x-4">
              <TouchableOpacity
                onPress={playRecording}
                className="w-14 h-14 bg-blue-500 rounded-2xl justify-center items-center shadow-lg shadow-blue-500/25"
              >
                <Ionicons
                  name={player.playing ? 'pause' : 'play'}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={stopPlayback}
                className="w-14 h-14 bg-gray-500 rounded-2xl justify-center items-center shadow-lg shadow-gray-500/25"
              >
                <Ionicons name="stop" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={resetRecording}
                className="w-14 h-14 bg-orange-500 rounded-2xl justify-center items-center shadow-lg shadow-orange-500/25"
              >
                <Ionicons name="refresh" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {recordingUri && (
          <View className="space-y-3">
            <TouchableOpacity
              onPress={uploadRecording}
              disabled={isUploading}
              className={`py-4 rounded-2xl items-center shadow-lg ${
                isUploading 
                  ? 'bg-gray-300' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/25'
              }`}
            >
              <View className="flex-row items-center">
                {isUploading ? (
                  <>
                    <Ionicons name="time" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Processing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Create Task</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetRecording}
              className="py-4 rounded-2xl items-center bg-white border-2 border-gray-200"
            >
              <View className="flex-row items-center">
                <Ionicons name="mic" size={18} color="#6b7280" />
                <Text className="text-gray-700 font-semibold text-base ml-2">Record Again</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancel Button */}
        <TouchableOpacity 
          onPress={handleModalClose} 
          className="mt-6 py-4 px-6 bg-white border border-gray-200 rounded-2xl items-center"
        >
          <Text className="text-center text-base font-semibold text-gray-600">Cancel</Text>
        </TouchableOpacity>
      </View>  
    </BottomSheet>
  );
}