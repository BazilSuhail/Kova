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
import { useColorScheme } from 'nativewind';
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

import AudioVisualizer from '@/components/voice-tasks/AudioVisualizer';
import RecordingAnimation from '@/components/voice-tasks/RecordingAnimation';
import { getCategoryColor } from '@/constants/getCategoryColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VoiceInputScreen() {
  const { colorScheme } = useColorScheme()
  const insets = useSafeAreaInsets()
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
  const [isPlaying, setIsPlaying] = useState(false);
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
        console.log(status, "sdsd")
        if (!status.granted) {
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && recordingUri) {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }

      playbackTimerRef.current = setInterval(() => {
        setPlaybackTime(prev => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            setIsPlaying(false);
            player.pause();
            return duration;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, recordingUri, duration]);

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
    try {
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

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

  const playRecording = async () => {
    if (!recordingUri) {
      Alert.alert('Error', 'No recording found');
      return;
    }

    try {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
      } else {
        if (!player.playing && playbackTime === 0) {
          await player.replace({ uri: recordingUri });
        }

        await player.play();
        setIsPlaying(true);

        if (duration === 0 && recordingTime > 0) {
          setDuration(recordingTime);
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const stopRecording = async () => {
    if (!isPrepared || !recorder.isRecording) return;

    try {
      await recorder.stop();
      const recordingURI = recorder.uri;
      setRecordingUri(recordingURI);
      setIsPrepared(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setDuration(recordingTime);
      setPlaybackTime(0);

      if (recordingURI) {
        await getFileSize(recordingURI);
      }

    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsPrepared(false);
    }
  };

  const stopPlayback = async () => {
    try {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
      }
      setPlaybackTime(0);
      if (recordingUri) {
        await player.replace({ uri: recordingUri });
      }
    } catch (error) {
      console.error('Stop playback error:', error);
    }
  };

  const resetRecording = async () => {
    try {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
      }
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

  const handleRecordPress = useCallback(() => {
    if (recorder.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recorder.isRecording]);

  const handleCloseModal = useCallback(() => {
    router.back();
  }, []);

  const handleGenerateTask = useCallback(async () => {
    if (!recordingUri) return;

    await getFileSize(recordingUri);

    setLoading(true);
    setShowVoiceModal(false);

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

  const getRecordButtonStyle = () => {
    if (!isPermissionGranted || (recordingUri && !recorder.isRecording)) {
      return 'bg-slate-400';
    }
    if (recorder.isRecording) {
      return 'bg-rose-500';
    }
    return 'bg-emerald-500';
  };


  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Main StatusBar - Always present except when modal is shown */}
      {!showVoiceModal && (
        <StatusBar
          barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"}
          backgroundColor={colorScheme === 'dark' ? "#111827" : "#F3F4F6"}
        />
      )}

      {loading ? (
        <Animated.View
          className="flex-1 justify-center items-center px-8 bg-white dark:bg-gray-900"
          style={{ opacity: fadeAnim }}
        >
          {/* Loading State */}
          <View className="items-center">
            <View
              className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl items-center justify-center border border-emerald-100 dark:border-emerald-800"
              style={{ marginBottom: 24 }}
            >
              <MaterialCommunityIcons
                name="brain"
                size={40}
                color={colorScheme === 'dark' ? "#34D399" : "#059669"}
              />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              AI is thinking...
            </Text>
            <Text
              className="text-gray-500 dark:text-gray-400 text-center mb-8 leading-6 max-w-xs"
              style={{ marginBottom: 32 }}
            >
              Analyzing your request and creating the perfect task structure
            </Text>
            <ActivityIndicator size="large" color={colorScheme === 'dark' ? "#34D399" : "#059669"} />

            {/* Progress Steps */}
            <View className="w-full max-w-xs" style={{ marginTop: 32 }}>
              <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                <View className="w-2 h-2 bg-emerald-500 rounded-full" style={{ marginRight: 12 }} />
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                  Processing natural language
                </Text>
              </View>
              <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                <View className="w-2 h-2 bg-emerald-300 dark:bg-emerald-600 rounded-full" style={{ marginRight: 12 }} />
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Extracting task details
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" style={{ marginRight: 12 }} />
                <Text className="text-sm text-gray-400 dark:text-gray-500">
                  Generating final task
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top }}
        >
          {/* Task Review & Edit Form - Always visible behind modal */}
          <View className="px-6 pt-5">
            {/* Header */}
            <View
              className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800"
              style={{ marginBottom: 32 }}
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl items-center justify-center" style={{ marginRight: 16 }}>
                  <Ionicons
                    name="mic"
                    size={32}
                    color={colorScheme === 'dark' ? "#34D399" : "#059669"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-800 dark:text-white">
                    {task.title ? 'Voice Task Generated' : 'Create Task with Voice'}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-[12px]">
                    {task.title
                      ? 'Your voice task has been processed. Review and edit as needed.'
                      : 'Record a voice note to create a task with AI'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Form Fields */}
            <View>
              {/* Title Field */}
              <View style={{ marginBottom: 24 }}>
                <View className="flex-row justify-between items-center" style={{ marginBottom: 12 }}>
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                      <Ionicons
                        name="bookmark"
                        size={14}
                        color={colorScheme === 'dark' ? "#34D399" : "#059669"}
                      />
                    </View>
                    <Text className="text-gray-800 dark:text-white font-semibold">Title</Text>
                    <Text className="text-red-400 ml-1">*</Text>
                  </View>

                  {task.title ? (
                    <View className="items-center">
                      <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
                        <Ionicons
                          name="sparkles"
                          size={14}
                          color={colorScheme === 'dark' ? "#34D399" : "#059669"}
                        />
                        <Text className="text-emerald-700 dark:text-emerald-400 text-sm font-medium ml-2">
                          Generated by AI
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>

                <TextInput
                  value={task.title}
                  onChangeText={(text) => setTask({ ...task, title: text })}
                  className="bg-white dark:bg-gray-800 px-4 py-4 rounded-xl text-base text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500"
                  placeholder={task.title ? "Enter task title" : "Task title will appear here"}
                  placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#6B7280"}
                />
              </View>

              {/* Description Field */}
              <View style={{ marginBottom: 24 }}>
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                    <Ionicons
                      name="document-text"
                      size={14}
                      color={colorScheme === 'dark' ? "#34D399" : "#059669"}
                    />
                  </View>
                  <Text className="text-gray-800 dark:text-white font-semibold">Description</Text>
                </View>
                <TextInput
                  value={task.description}
                  onChangeText={(text) => setTask({ ...task, description: text })}
                  className="bg-white dark:bg-gray-800 px-4 py-4 rounded-xl text-base text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500 min-h-[100px]"
                  multiline
                  placeholder={task.description ? "Add more details about your task" : "Description will appear here"}
                  placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#6B7280"}
                  textAlignVertical="top"
                />
              </View>

              {/* Category and Priority Row */}
              <View className="flex-row" style={{ marginBottom: 24 }}>
                {/* Category */}
                <View className="flex-1" style={{ marginRight: 16 }}>
                  <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                    <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                      <Ionicons
                        name="folder"
                        size={14}
                        color={colorScheme === 'dark' ? "#34D399" : "#059669"}
                      />
                    </View>
                    <Text className="text-gray-800 dark:text-white font-semibold">Category</Text>
                  </View>
                  <TextInput
                    value={task.category}
                    onChangeText={(text) => setTask({ ...task, category: text })}
                    className={`px-4 py-4 rounded-xl text-base border border-gray-200 dark:border-gray-700 ${task.category
                        ? `${getCategoryColor(task.category, colorScheme === 'dark').bg} ${getCategoryColor(task.category, colorScheme === 'dark').text}`
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white'
                      }`}
                    placeholder="Work, Personal ..."
                    placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#6B7280"}
                  />
                </View>

                {/* Priority */}
                <View className="flex-1">
                  <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                    <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                      <Ionicons
                        name="flag"
                        size={14}
                        color={colorScheme === 'dark' ? "#34D399" : "#059669"}
                      />
                    </View>
                    <Text className="text-gray-800 dark:text-white font-semibold">Priority</Text>
                  </View>
                  <View className="relative">
                    <TextInput
                      value={task.priority}
                      onChangeText={(text) => setTask({ ...task, priority: text })}
                      className="bg-white dark:bg-gray-800 px-4 py-4 pr-10 rounded-xl text-base text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500"
                      placeholder={task.priority ? "Set priority" : "Priority will appear here"}
                      placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#6B7280"}
                    />
                    <View className="absolute right-3 top-1/2 -mt-2">
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={colorScheme === 'dark' ? "#9CA3AF" : "#6B7280"}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Due Date Field */}
              <View style={{ marginBottom: 24 }}>
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                    <Ionicons
                      name="calendar"
                      size={14}
                      color={colorScheme === 'dark' ? "#34D399" : "#059669"}
                    />
                  </View>
                  <Text className="text-gray-800 dark:text-white font-semibold">Due Date</Text>
                </View>
                <TouchableOpacity
                  className="bg-white dark:bg-gray-800 px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
                >
                  <Text
                    className={`text-base ${task.dueDate
                      ? 'text-gray-800 dark:text-white'
                      : (colorScheme === 'dark' ? 'text-gray-500' : 'text-gray-400')}`}
                  >
                    {task.dueDate ? formatDate(task.dueDate) : 'Due date will appear here'}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colorScheme === 'dark' ? "#9CA3AF" : "#6B7280"}
                  />
                </TouchableOpacity>
              </View>

              {/* Estimated Time Field */}
              <View style={{ marginBottom: 32 }}>
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                    <Ionicons
                      name="time"
                      size={14}
                      color={colorScheme === 'dark' ? "#34D399" : "#059669"}
                    />
                  </View>
                  <Text className="text-gray-800 dark:text-white font-semibold">Estimated Time</Text>
                </View>
                <TextInput
                  value={task.estimatedTime}
                  onChangeText={(text) => setTask({ ...task, estimatedTime: text })}
                  className="bg-white dark:bg-gray-800 px-4 py-4 rounded-xl text-base text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500"
                  placeholder={task.estimatedTime ? "How long will this take?" : "Estimated time will appear here"}
                  placeholderTextColor={colorScheme === 'dark' ? "#9CA3AF" : "#6B7280"}
                />
              </View>
            </View>

            <View className='w-full h-[2px] bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6' />

            {/* Action Buttons */}
            <View className="flex-row" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={handleSave}
                className="bg-emerald-600 flex-1 py-3 rounded-xl items-center flex-row justify-center"
                activeOpacity={0.8}
                disabled={!task.title}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={task.title ? "white" : (colorScheme === 'dark' ? "#9CA3AF" : "#6B7280")}
                />
                <Text className={`text-base font-semibold ml-2 ${task.title ? 'text-white' : (colorScheme === 'dark' ? 'text-gray-500' : 'text-gray-400')}`}>
                  {task.title ? 'Save Task' : 'Save (Unavailable)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancel}
                className="bg-white dark:bg-gray-800 py-3 px-4 rounded-xl items-center flex-row justify-center border border-gray-200 dark:border-gray-700"
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={colorScheme === 'dark' ? "#9CA3AF" : "#6B7280"}
                />
                <Text className="text-gray-700 dark:text-gray-300 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRegenerate}
                className="bg-white dark:bg-gray-800 p-3 rounded-xl items-center flex-row justify-center border border-gray-200 dark:border-gray-700"
              >
                <Ionicons
                  name="refresh"
                  size={23}
                  color={colorScheme === 'dark' ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Voice Input Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showVoiceModal}
        onRequestClose={handleCloseModal}
      >
        <StatusBar
          backgroundColor={colorScheme === 'dark' ? "#00000099" : "#00000066"}
          barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"}
        />
        <View className="flex-1 bg-black/40 dark:bg-black/60 justify-center items-center">
          <View
            className={`bg-gray-50 dark:bg-gray-800 w-[85%] p-5 rounded-3xl ${recordingUri ? 'h-[50%]' : 'h-[60%]'}`}
          >
            {/* Permission Warning */}
            {!isPermissionGranted && (
              <View className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[12px] p-4 mb-6">
                <View className="flex-row items-center">
                  <Ionicons
                    name="warning"
                    size={20}
                    color={colorScheme === 'dark' ? "#F87171" : "#dc2626"}
                  />
                  <Text className="text-rose-700 dark:text-rose-400 font-medium ml-3 flex-1">
                    Microphone permission required
                  </Text>
                </View>
                <Text className="text-rose-600 dark:text-rose-500 text-sm mt-2 ml-8">
                  Enable microphone access in settings
                </Text>
              </View>
            )}

            {/* Recording Section - Only show when NOT recording and NO recording exists */}
            {!recordingUri && !recorder.isRecording && (
              <View className="flex-1 items-center justify-center mb-6">
                <View className="relative mb-8 w-24 h-24">
                  <TouchableOpacity
                    onPress={handleRecordPress}
                    disabled={!isPermissionGranted}
                    className={`w-24 h-24 rounded-full justify-center items-center ${getRecordButtonStyle()}`}
                  >
                    <Ionicons
                      name="mic"
                      size={32}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-gray-600 dark:text-gray-400 text-center mb-2">
                  {!isPermissionGranted
                    ? 'Grant microphone access'
                    : 'Tap to start recording'}
                </Text>
              </View>
            )}

            {/* Recording Section - Show during recording with animation */}
            {recorder.isRecording && (
              <View className="flex-1 items-center justify-center mb-6">
                <View className="relative mb-8 w-24 h-24">
                  <RecordingAnimation
                    isRecording={recorder.isRecording}
                    size={96}
                  />

                  <TouchableOpacity
                    onPress={handleRecordPress}
                    className="w-24 h-24 rounded-full justify-center items-center bg-emerald-500"
                  >
                    <Ionicons
                      name="stop"
                      size={32}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-gray-600 dark:text-gray-400 text-center mb-2">
                  Recording... Tap to stop
                </Text>
                <Text className="text-emerald-600 dark:text-emerald-400 font-mono text-lg">
                  {formatTime(recorder.recordingTime)}
                </Text>
              </View>
            )}

            {/* Playback Controls - Show after recording is complete */}
            {recordingUri && (
              <View className="flex-1 justify-center">
                <View className="bg-emerald-50 dark:bg-emerald-900/20 rounded-[12px] p-5 mb-6 border border-emerald-200 dark:border-emerald-800">
                  <View className="mb-4">
                    <AudioVisualizer
                      mode={recorder.isRecording ? 'recording' : 'playback'}
                      isActive={recorder.isRecording || isPlaying}
                      currentTime={recorder.isRecording ? recorder.recordingTime : playbackTime}
                      duration={recorder.isRecording ? recorder.recordingTime : duration}
                    />
                  </View>

                  <View className="flex-row justify-center items-center" style={{ gap: 5 }}>
                    {isPlaying ?
                      <TouchableOpacity
                        onPress={stopPlayback}
                        className="w-10 h-10 bg-gray-500 dark:bg-gray-600 rounded-[12px] justify-center items-center"
                      >
                        <Ionicons name="stop" size={20} color="white" />
                      </TouchableOpacity>
                      :
                      <TouchableOpacity
                        onPress={playRecording}
                        className="w-12 h-12 bg-emerald-500 rounded-full justify-center items-center"
                      >
                        <Ionicons
                          name={isPlaying ? 'pause' : 'play'}
                          size={22}
                          color="white"
                        />
                      </TouchableOpacity>
                    }

                    <TouchableOpacity
                      onPress={resetRecording}
                      className="py-3 px-4 rounded-[12px] relative overflow-hidden"
                    >
                      <LinearGradient
                        colors={['#059669', '#10b981']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="absolute inset-0 rounded-[12px]"
                      />
                      <View className="flex-row items-center z-10">
                        <Ionicons name="mic" size={16} color="white" />
                        <Text className="text-white font-semibold text-sm ml-2">Record Again</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row mt-4">
              <TouchableOpacity
                className="flex-1 bg-gray-50 dark:bg-gray-700 py-3 rounded-[12px] items-center border border-gray-200 dark:border-gray-600 mr-3"
                onPress={handleCloseModal}
              >
                <Text className="text-gray-600 dark:text-gray-300 text-[14px] font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGenerateTask}
                disabled={!recordingUri}
                className="flex-1 flex-row items-center justify-center py-3 rounded-[12px] relative"
              >
                {recordingUri && (
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 12,
                    }}
                  />
                )}

                <Ionicons
                  name="sparkles"
                  size={16}
                  color={recordingUri ? 'white' : (colorScheme === 'dark' ? '#9CA3AF' : '#6B7280')}
                />
                <Text
                  className={`ml-2 text-[14px] font-semibold ${recordingUri ? 'text-white' : (colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}
                >
                  Generate Task
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}