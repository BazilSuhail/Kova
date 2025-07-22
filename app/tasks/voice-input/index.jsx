import { Ionicons } from '@expo/vector-icons';
import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder
} from 'expo-audio';
import { useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function VoiceInput() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission required', 'Please grant microphone access');
      } else {
        await setAudioModeAsync({ 
          playsInSilentMode: true, 
          allowsRecording: true 
        });
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const uploadRecording = () => {
    const uri = recorder.uri;
    if (!uri) return;
    console.log('🎙️ Uploading file:', uri);
    Alert.alert('Uploaded', 'Voice sent to backend (simulated)');
  };

  const resetRecording = () => recorder.reset();

  return (
    <View className="flex-1 bg-white p-6 justify-center items-center">
      <Text className="text-xl font-bold text-gray-800 mb-8">Voice Task Input</Text>

      <TouchableOpacity
        onPressIn={startRecording}
        onPressOut={stopRecording}
        disabled={!!recorder.uri}
        className={`w-24 h-24 rounded-full justify-center items-center ${
          recorder.uri ? 'bg-gray-300' : 'bg-indigo-600'
        }`}
      >
        <Ionicons name="mic" size={32} color="white" />
      </TouchableOpacity>

      <Text className="mt-4 text-gray-500 text-sm">
        {recorder.isRecording
          ? 'Recording...'
          : recorder.uri
          ? 'Recording complete'
          : 'Hold to record'}
      </Text>

      {recorder.uri && (
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