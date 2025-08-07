import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';

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

export default function VoiceInputScreen() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer();

  const [showVoiceModal, setShowVoiceModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isPrepared, setIsPrepared] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const [task, setTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    dueDate: '',
    estimatedTime: '',
  });

  const timerRef = useRef(null);
  const playbackTimerRef = useRef(null);
  const buttonScale = useSharedValue(1);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      if (showVoiceModal || loading) {
        router.back();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [showVoiceModal, loading]);

  useEffect(() => {
    setShowVoiceModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const getFileSize = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        const sizeInMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
        console.log(`📁 Recording file size: ${sizeInMB} MB (${fileInfo.size} bytes)`);
        return fileInfo.size;
      }
    } catch (error) {
      console.error('Error getting file size:', error);
    }
    return 0;
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

      // Get file size when recording stops
      if (recorder.uri) {
        await getFileSize(recorder.uri);
      }

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

  const handleCloseModal = useCallback(() => {
    router.back();
  }, []);

  const handleGenerateTask = useCallback(async () => {
    if (!recordingUri) return;

    // Log file size one more time before generating task
    await getFileSize(recordingUri);

    setLoading(true);
    setShowVoiceModal(false);

    // Simulate processing voice recording (3 sec)
    setTimeout(() => {
      const dummyTask = {
        title: 'Schedule team meeting',
        description: 'Set up a meeting with the product team to discuss Q3 roadmap.',
        category: 'Work',
        priority: 'High',
        dueDate: '2025-08-12T15:00:00Z',
        estimatedTime: '1 hour',
      };
      setTask(dummyTask);
      setLoading(false);
    }, 3000);
  }, [recordingUri]);

  const handleSave = useCallback(() => {
    console.log('✅ Task Saved:', task);
    router.back();
  }, [task]);

  const handleRegenerate = useCallback(() => {
    setTask({
      title: '',
      description: '',
      category: '',
      priority: '',
      dueDate: '',
      estimatedTime: '',
    });
    setRecordingUri(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    setDuration(0);
    setShowVoiceModal(true);
  }, []);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'academics':
        return { bg: 'bg-amber-100', text: 'text-amber-600' };
      case 'health':
        return { bg: 'bg-rose-100', text: 'text-rose-600' };
      case 'fitness':
        return { bg: 'bg-sky-100', text: 'text-sky-600' };
      case 'work':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'personal':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const getRecordButtonStyle = () => {
    if (!isPermissionGranted || (recordingUri && !recorder.isRecording)) {
      return 'bg-slate-400';
    }
    if (recorder.isRecording) {
      return 'bg-rose-500';
    }
    return 'bg-emerald-500';
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View className="flex-1 bg-gray-50">
        <Modal
          animationType="fade"
          transparent={true}
          visible={showVoiceModal}
          onRequestClose={handleCloseModal}
        >
          {showVoiceModal &&
            <StatusBar backgroundColor="#00000066" barStyle="dark-content" />
          }
          <View className="flex-1 bg-black/40 justify-center items-center">
            <View className="bg-gray-50 w-[95%] h-[60%]  p-5 rounded-3xl">
              <View>
                {/* Permission Warning */}
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
                    <View className="bg-white rounded-2xl px-6 py-4 border border-gray-200">
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

                {/* Recording Section */}
                <View className="flex-1 items-center justify-center mb-6">
                  <View className="relative mb-8">
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

                  <Text className="text-gray-600 text-center mb-2">
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

                {/* Record Again Option */}
                {recordingUri && (
                  <TouchableOpacity
                    onPress={resetRecording}
                    className="py-3 rounded-2xl items-center bg-white border border-gray-300 mb-4"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="mic" size={16} color="#6b7280" />
                      <Text className="text-gray-700 font-semibold text-sm ml-2">Record Again</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* Action Buttons */}
              <View className="flex-row mt-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-50 py-4 rounded-2xl items-center border border-gray-200"
                  onPress={handleCloseModal}
                  style={{ marginRight: 12 }}
                >
                  <Text className="text-gray-600 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleGenerateTask}
                  disabled={!recordingUri}
                  className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl ${!recordingUri ? 'bg-gray-200' : 'bg-emerald-500'
                    }`}
                >
                  {recordingUri && (
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="absolute inset-0 rounded-2xl"
                    />
                  )}
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color={recordingUri ? 'white' : '#9CA3AF'}
                  />
                  <Text
                    className={`ml-2 font-semibold ${recordingUri ? 'text-white' : 'text-gray-400'
                      }`}
                  >
                    Generate Task
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Loading State */}
        {loading && (
          <Animated.View
            className="flex-1 justify-center items-center px-8 bg-white"
            style={{ opacity: fadeAnim }}
          >
            <View className="items-center">
              <View
                className="w-24 h-24 bg-emerald-50 rounded-3xl items-center justify-center border border-emerald-100"
                style={{ marginBottom: 24 }}
              >
                <MaterialCommunityIcons name="brain" size={40} color="#059669" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">Processing Voice...</Text>
              <Text
                className="text-gray-500 text-center mb-8 leading-6 max-w-xs"
                style={{ marginBottom: 32 }}
              >
                Analyzing your voice recording and creating the perfect task structure
              </Text>
              <ActivityIndicator size="large" color="#059669" />

              {/* Progress Steps */}
              <View className="w-full max-w-xs" style={{ marginTop: 32 }}>
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-2 h-2 bg-emerald-500 rounded-full" style={{ marginRight: 12 }} />
                  <Text className="text-sm text-gray-600">Processing voice recording</Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-2 h-2 bg-emerald-300 rounded-full" style={{ marginRight: 12 }} />
                  <Text className="text-sm text-gray-500">Extracting task details</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-gray-300 rounded-full" style={{ marginRight: 12 }} />
                  <Text className="text-sm text-gray-400">Generating final task</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Task Review & Edit Form */}
        {!loading && (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="px-6 pt-16 pb-8">
              {/* Header */}
              <View
                className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100"
                style={{ marginBottom: 32 }}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-emerald-100 rounded-2xl items-center justify-center" style={{ marginRight: 16 }}>
                    <Ionicons name="checkmark-circle" size={32} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">Review Your Task</Text>
                    <Text className="text-gray-500 text-[12px]">
                      AI has generated your task from voice. Feel free to make any adjustments.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Form Fields */}
              <View>
                <View style={{ marginBottom: 24 }}>
                  <View className="flex-row justify-between items-center" style={{ marginBottom: 12 }}>
                    <View className="flex-row items-center">
                      <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                        <Ionicons name="bookmark" size={14} color="#059669" />
                      </View>
                      <Text className="text-gray-800 font-semibold">Title</Text>
                      <Text className="text-red-400 ml-1">*</Text>
                    </View>

                    <View className="items-center">
                      <View className="flex-row items-center bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                        <Ionicons name="mic" size={14} color="#059669" />
                        <Text className="text-emerald-700 text-sm font-medium ml-2">
                          Generated from Voice
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TextInput
                    value={task.title}
                    onChangeText={(text) => setTask({ ...task, title: text })}
                    className="bg-white px-4 py-4 rounded-xl text-base text-gray-800 border border-gray-200 focus:border-emerald-300"
                    placeholder="Enter task title"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Description Field */}
                <View style={{ marginBottom: 24 }}>
                  <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                    <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                      <Ionicons name="document-text" size={14} color="#059669" />
                    </View>
                    <Text className="text-gray-800 font-semibold">Description</Text>
                  </View>
                  <TextInput
                    value={task.description}
                    onChangeText={(text) => setTask({ ...task, description: text })}
                    className="bg-white px-4 py-4 rounded-xl text-base text-gray-800 border border-gray-200 focus:border-emerald-300 min-h-[100px]"
                    multiline
                    placeholder="Add more details about your task"
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>

                {/* Category and Priority Row */}
                <View className="flex-row" style={{ marginBottom: 24 }}>
                  {/* Category */}
                  <View className="flex-1" style={{ marginRight: 16 }}>
                    <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                      <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                        <Ionicons name="folder" size={14} color="#059669" />
                      </View>
                      <Text className="text-gray-800 font-semibold">Category</Text>
                    </View>
                    <View className="relative">
                      <TextInput
                        value={task.category}
                        onChangeText={(text) => setTask({ ...task, category: text })}
                        className="bg-white px-4 py-4 pr-10 rounded-xl text-base text-gray-800 border border-gray-200 focus:border-emerald-300"
                        placeholder="Select category"
                        placeholderTextColor="#9CA3AF"
                      />
                      <View className="absolute right-3 top-1/2 -mt-2">
                        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                      </View>
                    </View>
                    {/* Category Accent Pill */}
                    {task.category && (
                      <View className={`mt-2 px-3 py-1 rounded-full ${getCategoryColor(task.category).bg}`}>
                        <Text className={`text-sm font-medium ${getCategoryColor(task.category).text}`}>
                          {task.category}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Priority */}
                  <View className="flex-1">
                    <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                      <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                        <Ionicons name="flag" size={14} color="#059669" />
                      </View>
                      <Text className="text-gray-800 font-semibold">Priority</Text>
                    </View>
                    <View className="relative">
                      <TextInput
                        value={task.priority}
                        onChangeText={(text) => setTask({ ...task, priority: text })}
                        className="bg-white px-4 py-4 pr-10 rounded-xl text-base text-gray-800 border border-gray-200 focus:border-emerald-300"
                        placeholder="Set priority"
                        placeholderTextColor="#9CA3AF"
                      />
                      <View className="absolute right-3 top-1/2 -mt-2">
                        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Due Date Field */}
                <View style={{ marginBottom: 24 }}>
                  <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                    <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                      <Ionicons name="calendar" size={14} color="#059669" />
                    </View>
                    <Text className="text-gray-800 font-semibold">Due Date</Text>
                  </View>
                  <TouchableOpacity
                    className="bg-white px-4 py-4 rounded-xl border border-gray-200 flex-row items-center justify-between"
                  >
                    <Text className={`text-base ${task.dueDate ? 'text-gray-800' : 'text-gray-400'}`}>
                      {task.dueDate ? formatDate(task.dueDate) : 'Select due date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Estimated Time Field */}
                <View style={{ marginBottom: 32 }}>
                  <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                    <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                      <Ionicons name="time" size={14} color="#059669" />
                    </View>
                    <Text className="text-gray-800 font-semibold">Estimated Time</Text>
                  </View>
                  <TextInput
                    value={task.estimatedTime}
                    onChangeText={(text) => setTask({ ...task, estimatedTime: text })}
                    className="bg-white px-4 py-4 rounded-xl text-base text-gray-800 border border-gray-200 focus:border-emerald-300"
                    placeholder="How long will this take?"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ marginTop: 32 }}>
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-emerald-600 py-4 rounded-xl items-center flex-row justify-center"
                  activeOpacity={0.8}
                  style={{ marginBottom: 16 }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white text-base font-semibold ml-2">Save Task</Text>
                </TouchableOpacity>

                <View className="flex-row">
                  <TouchableOpacity
                    onPress={handleRegenerate}
                    className="flex-1 bg-white py-4 rounded-xl items-center flex-row justify-center border border-gray-200"
                    style={{ marginRight: 12 }}
                  >
                    <Ionicons name="refresh" size={18} color="#6B7280" />
                    <Text className="text-gray-700 font-medium ml-2">Regenerate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="flex-1 bg-white py-4 rounded-xl items-center flex-row justify-center border border-gray-200"
                    style={{ marginLeft: 12 }}
                  >
                    <Ionicons name="close" size={18} color="#6B7280" />
                    <Text className="text-gray-700 font-medium ml-2">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}