import { Ionicons } from '@expo/vector-icons';
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
  Alert,
  Animated,
  BackHandler,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import AudioVisualizer from '@/components/voice-tasks/AudioVisualizer';
import RecordingAnimation from '@/components/voice-tasks/RecordingAnimation';

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
  const [isPlaying, setIsPlaying] = useState(false); // Manual playing state
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
  // Removed buttonScale shared value to avoid reanimated warnings

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

  // Remove debug logs when not needed
  // useEffect(() => {
  //   console.log('🎵 Player state changed - isPlaying:', isPlaying);
  // }, [isPlaying]);

  // Simple playback timer - just count seconds during playback
  useEffect(() => {
    if (isPlaying && recordingUri) {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }

      playbackTimerRef.current = setInterval(() => {
        setPlaybackTime(prev => {
          const newTime = prev + 1;
          // Auto-stop when reaching the end
          if (newTime >= duration) {
            setIsPlaying(false);
            player.pause();
            return duration;
          }
          return newTime;
        });
      }, 1000); // Update every second
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
    // if (!isPermissionGranted) { 
    //   return;
    // }

    try {
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await recorder.prepareToRecordAsync();
      setIsPrepared(true);
      recorder.record();

      // Start recording timer
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
        // Pause if already playing
        await player.pause();
        setIsPlaying(false);
      } else {
        // Only replace the audio if it hasn't been loaded yet
        if (!player.playing && playbackTime === 0) {
          await player.replace({ uri: recordingUri });
        }

        await player.play();
        setIsPlaying(true);

        // If we don't have duration yet, set it from the file
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

      // Set duration from recording time and reset playback
      setDuration(recordingTime);
      setPlaybackTime(0);

      // Get file size when recording stops
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
      // Reset to beginning
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

      // Clear all timers
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

  const getRecordButtonStyle = () => {
    if (!isPermissionGranted || (recordingUri && !recorder.isRecording)) {
      return 'bg-slate-400';
    }
    if (recorder.isRecording) {
      return 'bg-rose-500';
    }
    return 'bg-emerald-500';
  };

  // Removed animated style to avoid reanimated warnings

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
          {showVoiceModal && (
            <StatusBar backgroundColor="#00000066" barStyle="dark-content" />
          )}

          <View className="flex-1 bg-black/40 justify-center items-center">
            <View
              className={`bg-gray-50 w-[85%] p-5 rounded-3xl ${recordingUri ? 'h-[50%]' : 'h-[60%]'
                }`}
            >
              {/* Permission Warning */}
              {!isPermissionGranted && (
                <View className="bg-rose-50 border border-rose-200 rounded-[12px] p-4 mb-6">
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

              {/* Recording Section - Only show when NOT recording and NO recording exists */}
              {!recordingUri && !recorder.isRecording && (
                <View className="flex-1 items-center justify-center mb-6">
                  <View className="relative mb-8 w-24 h-24">
                    <TouchableOpacity
                      onPress={handleRecordPress}
                      disabled={!isPermissionGranted}
                      className={`w-24 h-24 rounded-full justify-center items-center ${getRecordButtonStyle()}`}
                      style={{ transform: [{ scale: 1 }] }}
                    >
                      <Ionicons
                        name="mic"
                        size={32}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-gray-600 text-center mb-2">
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

                  <Text className="text-gray-600 text-center mb-2">
                    Recording... Tap to stop
                  </Text>
                  <Text className="text-emerald-600 font-mono text-lg">
                    {formatTime(recordingTime)}
                  </Text>
                </View>
              )}

              {/* Playback Controls - Show after recording is complete */}
              {recordingUri && (
                <View className="flex-1 justify-center">
                  <View className="bg-emerald-50 rounded-[12px] p-5 mb-6 border border-emerald-200">
                    {/* Audio Visualizer with integrated time display and progress */}
                    <View className="mb-4">
                      {/* <AudioVisualizer
                        isPlaying={player.playing}
                        progress={duration > 0 ? (playbackTime / duration) * 100 : 0}
                        currentTime={playbackTime}
                        duration={duration}
                      /> */}
                      <AudioVisualizer
                        mode={recorder.isRecording ? 'recording' : 'playback'}
                        isActive={recorder.isRecording || isPlaying}
                        currentTime={recorder.isRecording ? recordingTime : playbackTime}
                        duration={recorder.isRecording ? recordingTime : duration}
                      />

                    </View>

                    {/* Control Buttons */}
                    <View className="flex-row justify-center items-center" style={{gap:5}}>
                      {/* Play/Pause Button */}
                      {isPlaying ?
                        <TouchableOpacity
                          onPress={stopPlayback}
                          className="w-10 h-10 bg-gray-500 rounded-[12px] justify-center items-center"
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

                      {/* Record Again Button */}
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
                  className="flex-1 bg-gray-50 py-3 rounded-[12px] items-center border border-gray-200 mr-3"
                  onPress={handleCloseModal}
                >
                  <Text className="text-gray-600 text-[14px] font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleGenerateTask}
                  disabled={!recordingUri}
                  className="flex-1 flex-row items-center justify-center py-3 rounded-[12px] relative"
                >
                  {/* Background gradient */}
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
                    color={recordingUri ? 'white' : '#9CA3AF'}
                  />
                  <Text
                    className={`ml-2 text-[14px] font-semibold ${recordingUri ? 'text-white' : 'text-gray-400'
                      }`}
                  >
                    Generate Task
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </>
  );
}