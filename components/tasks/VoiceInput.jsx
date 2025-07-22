import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceInput() {
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please grant microphone access');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordedUri(uri);
    setRecording(null);
  };

  const uploadRecording = () => {
    if (!recordedUri) return;
    console.log('🎙️ Uploading file:', recordedUri);
    Alert.alert('Uploaded', 'Voice sent to backend (simulated)');
  };

  const resetRecording = () => {
    setRecordedUri(null);
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center items-center">
      <Text className="text-xl font-bold text-gray-800 mb-8">Voice Task Input</Text>

      <TouchableOpacity
        onPressIn={startRecording}
        onPressOut={stopRecording}
        disabled={!!recordedUri}
        className={`w-24 h-24 rounded-full justify-center items-center ${recordedUri ? 'bg-gray-300' : 'bg-indigo-600'}`}
      >
        <Ionicons name="mic" size={32} color="white" />
      </TouchableOpacity>

      <Text className="mt-4 text-gray-500 text-sm">{recording ? 'Recording...' : recordedUri ? 'Recording complete' : 'Hold to record'}</Text>

      {recordedUri && (
        <View className="mt-6 space-y-3 w-full">
          <TouchableOpacity
            onPress={uploadRecording}
            className="bg-green-600 py-3 rounded-2xl items-center"
          >
            <Text className="text-white font-semibold">Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resetRecording}
            className="bg-gray-200 py-3 rounded-2xl items-center"
          >
            <Text className="text-gray-700 font-medium">Reset</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
