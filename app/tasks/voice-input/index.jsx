import { Ionicons } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function VoiceInput() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer();

  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isPrepared, setIsPrepared] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState(null);

  const timerRef = useRef(null);
  const playbackTimerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Permission required', 'Please grant microphone access');
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
      // Reset timer
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);

      // Prepare and start recording
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

  const uploadRecording = () => {
    if (!recordingUri) {
      Alert.alert('Error', 'No recording found');
      return;
    }

    console.log('Recording successful! File URI:', recordingUri);
    Alert.alert('Success', 'Recording uploaded successfully!');
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

  return (
    <View className="flex-1 bg-white p-6 justify-center items-center">
      <Text className="text-xl font-bold text-gray-800 mb-8">Voice Task Input</Text>

      {!isPermissionGranted && (
        <Text className="text-red-500 text-center mb-4">
          Microphone permission is required
        </Text>
      )}

      {(recorder.isRecording || recordingTime > 0) && (
        <View className="mb-6">
          <Text className="text-3xl font-mono text-center text-gray-700">
            {formatTime(recordingTime)}
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-1">
            {recorder.isRecording ? 'Recording...' : 'Recording Duration'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleRecordPress}
        disabled={!isPermissionGranted || (!!recordingUri && !recorder.isRecording)}
        className={`w-24 h-24 rounded-full justify-center items-center mb-6 ${
          !isPermissionGranted || (recordingUri && !recorder.isRecording)
            ? 'bg-gray-300'
            : recorder.isRecording
            ? 'bg-red-500'
            : 'bg-indigo-600'
        }`}
      >
        <Ionicons
          name={recorder.isRecording ? 'stop' : 'mic'}
          size={32}
          color="white"
        />
      </TouchableOpacity>

      <Text className="text-gray-500 text-sm text-center mb-8">
        {!isPermissionGranted
          ? 'Grant microphone permission to record'
          : recorder.isRecording
          ? 'Recording... Tap to stop'
          : recordingUri
          ? 'Recording complete'
          : 'Tap to start recording'}
      </Text>

      {recordingUri && (
        <View className="w-full space-y-4">
          <View className="flex-row justify-between items-center px-4">
            <Text className="text-sm text-gray-600 font-mono">
              {formatTime(playbackTime)}
            </Text>
            <Text className="text-sm text-gray-400">
              {player.playing ? 'Playing...' : 'Paused'}
            </Text>
            <Text className="text-sm text-gray-600 font-mono">
              {formatTime(duration)}
            </Text>
          </View>

          <View className="w-full h-2 bg-gray-200 rounded-full mx-4">
            <View
              className="h-full bg-indigo-500 rounded-full"
              style={{
                width: duration > 0 ? `${(playbackTime / duration) * 100}%` : '0%'
              }}
            />
          </View>

          <View className="flex-row justify-center space-x-4 mt-4">
            <TouchableOpacity
              onPress={playRecording}
              className="w-12 h-12 bg-blue-500 rounded-full justify-center items-center"
            >
              <Ionicons
                name={player.playing ? 'pause' : 'play'}
                size={20}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={stopPlayback}
              className="w-12 h-12 bg-gray-500 rounded-full justify-center items-center"
            >
              <Ionicons name="stop" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className="space-y-3 mt-6">
            <TouchableOpacity
              onPress={uploadRecording}
              className="bg-green-600 py-3 rounded-2xl items-center"
            >
              <Text className="text-white font-semibold">Upload Recording</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetRecording}
              className="bg-gray-200 py-3 rounded-2xl items-center"
            >
              <Text className="text-gray-700 font-medium">Record Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
