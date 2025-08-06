import { Ionicons } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder
} from 'expo-audio';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';

// Animated Recording Circles Component
const RecordingCircles = ({ isRecording }) => {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  const opacity1 = useSharedValue(0.3);
  const opacity2 = useSharedValue(0.2);
  const opacity3 = useSharedValue(0.1);

  useEffect(() => {
    if (isRecording) {
      // Start pulsing animations with different timings
      scale1.value = withRepeat(
        withTiming(1.8, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      scale2.value = withRepeat(
        withTiming(2.2, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      scale3.value = withRepeat(
        withTiming(2.8, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      
      opacity1.value = withRepeat(
        withTiming(0.1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      opacity2.value = withRepeat(
        withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      opacity3.value = withRepeat(
        withTiming(0.03, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      // Reset to initial state
      scale1.value = withSpring(1);
      scale2.value = withSpring(1);
      scale3.value = withSpring(1);
      opacity1.value = withSpring(0);
      opacity2.value = withSpring(0);
      opacity3.value = withSpring(0);
    }
  }, [isRecording]);

  const circle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: opacity3.value,
  }));

  return (
    <View className="absolute inset-0 items-center justify-center">
      <Animated.View
        style={[circle3Style]}
        className="absolute w-32 h-32 rounded-full border-2 border-emerald-500"
      />
      <Animated.View
        style={[circle2Style]}
        className="absolute w-32 h-32 rounded-full border-2 border-emerald-400"
      />
      <Animated.View
        style={[circle1Style]}
        className="absolute w-32 h-32 rounded-full border-2 border-emerald-600"
      />
    </View>
  );
};

// Task Creation Form
const TaskForm = ({ visible, onClose, onCreateTask }) => {
  const [taskText, setTaskText] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('Medium');

  const categories = [
    { name: 'Academics', color: 'amber-400', bgColor: 'amber-50' },
    { name: 'Health', color: 'rose-400', bgColor: 'rose-50' },
    { name: 'Fitness', color: 'sky-400', bgColor: 'sky-50' },
    { name: 'Personal', color: 'purple-400', bgColor: 'purple-50' }
  ];

  const priorities = ['Low', 'Medium', 'High'];

  const handleCreateTask = () => {
    if (taskText.trim()) {
      onCreateTask({ text: taskText, category, priority });
      setTaskText('');
      setCategory('Personal');
      setPriority('Medium');
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-gray-50 rounded-t-3xl" style={{ minHeight: '60%' }}>
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-gray-800">Create New Task</Text>
                <Text className="text-sm text-gray-500 mt-1">Describe what you need to do</Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            {/* Task Description */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-3">What do you need to do?</Text>
              <View className="bg-white rounded-2xl border border-gray-200 p-4">
                <TextInput
                  value={taskText}
                  onChangeText={setTaskText}
                  placeholder="e.g., Complete the quarterly report by Friday"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-gray-800 text-base leading-6"
                  style={{ minHeight: 100 }}
                />
              </View>
            </View>

            {/* Category Selection */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-3">Category</Text>
              <View className="flex-row flex-wrap">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => setCategory(cat.name)}
                    className={`mr-3 mb-3 px-4 py-3 rounded-2xl border-2 ${
                      category === cat.name 
                        ? `bg-${cat.bgColor} border-${cat.color}` 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`font-medium ${
                      category === cat.name ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Selection */}
            <View className="mb-8">
              <Text className="text-base font-semibold text-gray-800 mb-3">Priority</Text>
              <View className="flex-row">
                {priorities.map((pri) => (
                  <TouchableOpacity
                    key={pri}
                    onPress={() => setPriority(pri)}
                    className={`mr-3 px-6 py-3 rounded-2xl border-2 ${
                      priority === pri 
                        ? 'bg-emerald-50 border-emerald-400' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`font-medium ${
                      priority === pri ? 'text-emerald-700' : 'text-gray-600'
                    }`}>
                      {pri}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Create Button */}
          <View className="px-6 pb-6">
            <TouchableOpacity
              onPress={handleCreateTask}
              disabled={!taskText.trim()}
              className={`py-4 rounded-2xl items-center ${
                taskText.trim() 
                  ? 'bg-emerald-500 -lg -emerald-500/25' 
                  : 'bg-gray-300'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Create Task</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function VoiceInput() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer();

  const [modalVisible, setModalVisible] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isPrepared, setIsPrepared] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const timerRef = useRef(null);
  const playbackTimerRef = useRef(null);
  const buttonScale = useSharedValue(1);

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
    
    setTimeout(() => {
      console.log('Recording processed! File URI:', recordingUri);
      setIsUploading(false);
      setModalVisible(false);
      setShowTaskForm(true);
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
    buttonScale.value = withSpring(0.9, {}, () => {
      buttonScale.value = withSpring(1);
    });

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

  const handleCreateTask = (taskData) => {
    Alert.alert('Success', `Task "${taskData.text}" created successfully!`, [
      {
        text: 'OK',
        onPress: () => router.back()
      }
    ]);
  };

  const getRecordButtonStyle = () => {
    if (!isPermissionGranted || (recordingUri && !recorder.isRecording)) {
      return 'bg-slate-400';
    }
    if (recorder.isRecording) {
      return 'bg-emerald-500 -lg -emerald-500/30';
    }
    return 'bg-emerald-500 -lg -emerald-500/30';
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 bg-gray-900/60 justify-center items-center px-4">
          <View className="w-full max-w-sm bg-white rounded-3xl -xl">
            {/* Header */}
            <View className="px-6 pt-6 pb-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xl font-bold text-gray-800">Voice Input</Text>
                  <Text className="text-sm text-gray-500 mt-1">Record your task description</Text>
                </View>
                <View className="w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center">
                  <Ionicons name="mic" size={24} color="white" />
                </View>
              </View>
            </View>

            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              <View className="px-6 pb-6">
                {!isPermissionGranted && (
                  <View className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6">
                    <View className="flex-row items-center">
                      <Ionicons name="warning" size={20} color="#dc2626" />
                      <Text className="text-rose-700 font-medium ml-3 flex-1">
                        Microphone permission required
                      </Text>
                    </View>
                    <Text className="text-rose-600 text-sm mt-2 ml-8">
                      Enable microphone access in settings
                    </Text>
                  </View>
                )}

                {/* Recording Timer */}
                {(recorder.isRecording || recordingTime > 0) && (
                  <View className="items-center mb-6">
                    <View className="bg-gray-50 rounded-2xl px-6 py-4 border border-gray-200">
                      <Text className="text-3xl font-bold text-gray-800 text-center font-mono">
                        {formatTime(recordingTime)}
                      </Text>
                      <View className="flex-row items-center justify-center mt-2">
                        {recorder.isRecording && (
                          <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                        )}
                        <Text className="text-xs text-gray-500 font-medium">
                          {recorder.isRecording ? 'Recording...' : 'Ready'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Record Button with Animated Circles */}
                <View className="items-center mb-6">
                  <View className="relative">
                    <RecordingCircles isRecording={recorder.isRecording} />
                    <Animated.View style={animatedButtonStyle}>
                      <TouchableOpacity
                        onPress={handleRecordPress}
                        disabled={!isPermissionGranted || (!!recordingUri && !recorder.isRecording)}
                        className={`w-24 h-24 rounded-full justify-center items-center ${getRecordButtonStyle()}`}
                      >
                        <Ionicons
                          name={recorder.isRecording ? 'stop' : 'mic'}
                          size={32}
                          color="white"
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                  
                  <Text className="text-gray-600 text-sm text-center mt-4 px-4 leading-5">
                    {!isPermissionGranted
                      ? 'Grant microphone access'
                      : recorder.isRecording
                      ? 'Recording... Tap to stop'
                      : recordingUri
                      ? 'Recording complete'
                      : 'Tap to start recording'}
                  </Text>
                </View>

                {/* Playback Controls */}
                {recordingUri && (
                  <View className="bg-emerald-50 rounded-2xl p-5 mb-6 border border-emerald-200">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-sm font-mono text-emerald-700 bg-white px-3 py-2 rounded-lg">
                        {formatTime(playbackTime)}
                      </Text>
                      <View className="flex-row items-center">
                        <View className={`w-2 h-2 rounded-full mr-2 ${player.playing ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        <Text className="text-sm font-medium text-emerald-700">
                          {player.playing ? 'Playing' : 'Paused'}
                        </Text>
                      </View>
                      <Text className="text-sm font-mono text-emerald-700 bg-white px-3 py-2 rounded-lg">
                        {formatTime(duration)}
                      </Text>
                    </View>

                    <View className="w-full h-2 bg-emerald-200 rounded-full mb-4">
                      <View
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: duration > 0 ? `${(playbackTime / duration) * 100}%` : '0%'
                        }}
                      />
                    </View>

                    <View className="flex-row justify-center">
                      <TouchableOpacity
                        onPress={playRecording}
                        className="w-12 h-12 bg-emerald-500 rounded-2xl justify-center items-center mr-3"
                      >
                        <Ionicons
                          name={player.playing ? 'pause' : 'play'}
                          size={20}
                          color="white"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={stopPlayback}
                        className="w-12 h-12 bg-gray-500 rounded-2xl justify-center items-center mr-3"
                      >
                        <Ionicons name="stop" size={20} color="white" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={resetRecording}
                        className="w-12 h-12 bg-slate-400 rounded-2xl justify-center items-center"
                      >
                        <Ionicons name="refresh" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                {recordingUri && (
                  <View>
                    <TouchableOpacity
                      onPress={uploadRecording}
                      disabled={isUploading}
                      className={`py-4 rounded-2xl items-center mb-3 ${
                        isUploading 
                          ? 'bg-gray-300' 
                          : 'bg-emerald-500 -lg -emerald-500/25'
                      }`}
                    >
                      <View className="flex-row items-center">
                        {isUploading ? (
                          <>
                            <Ionicons name="time" size={18} color="white" />
                            <Text className="text-white font-bold text-base ml-2">Processing...</Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="checkmark" size={18} color="white" />
                            <Text className="text-white font-bold text-base ml-2">Create Task</Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={resetRecording}
                      className="py-3 rounded-2xl items-center bg-white border border-gray-300"
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="mic" size={16} color="#6b7280" />
                        <Text className="text-gray-700 font-semibold text-sm ml-2">Record Again</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Cancel Button */}
                <TouchableOpacity 
                  onPress={handleModalClose} 
                  className="mt-4 py-3 px-6 bg-gray-100 rounded-2xl items-center"
                >
                  <Text className="text-center text-sm font-semibold text-gray-600">Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TaskForm
        visible={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          router.back();
        }}
        onCreateTask={handleCreateTask}
      />
    </>
  );
}