import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

// Your custom animation component
import RecordingAnimation from '@/components/voice-tasks/RecordingAnimation';

export default function VoiceInputScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  // 1. Listen for Live Results
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript;
    if (text) setTranscript(text);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech Error:', event.error);
    setIsRecording(false);
    Alert.alert('Error', event.message || 'Speech recognition failed');
  });

  useSpeechRecognitionEvent('end', () => setIsRecording(false));

  // 2. Control Functions
  const handlePress = async () => {
    if (isRecording) {
      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
    } else {
      try {
        setTranscript('');
        setIsRecording(true);
        await ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          continuous: true,
        });
      } catch (e) {
        setIsRecording(false);
        Alert.alert('Permissions Required', 'Ensure microphone access is enabled in settings.');
      }
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950 px-6 justify-center">
      
      {/* Visual Feedback Area */}
      <View className="items-center justify-center h-64 mb-10">
        {isRecording ? (
          <RecordingAnimation isRecording={true} size={200} />
        ) : (
          <View className="w-40 h-40 rounded-full bg-emerald-50 dark:bg-emerald-900/10 items-center justify-center border border-emerald-100 dark:border-emerald-800">
            <Ionicons name="mic-outline" size={60} color="#10B981" />
          </View>
        )}
      </View>

      {/* Live Transcript Bubble */}
      <View className="min-h-[120px] w-full bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
          {isRecording ? 'Listening Now...' : 'Transcription'}
        </Text>
        <Text className="text-gray-900 dark:text-white text-lg font-medium leading-7">
          {transcript || (isRecording ? 'Say something...' : 'Your voice will appear here...')}
        </Text>
      </View>

      {/* Main Control Button */}
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.8}
        className={`mt-12 self-center w-20 h-20 rounded-full items-center justify-center shadow-lg ${
          isRecording ? 'bg-red-500 shadow-red-500/40' : 'bg-emerald-500 shadow-emerald-500/40'
        }`}
      >
        <Ionicons name={isRecording ? "stop" : "mic"} size={32} color="white" />
      </TouchableOpacity>

      {/* Done Action */}
      {transcript && !isRecording && (
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-8 bg-gray-900 dark:bg-white py-4 rounded-2xl items-center"
        >
          <Text className="text-white dark:text-gray-900 font-bold text-base">Process with ZenFlow AI</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}