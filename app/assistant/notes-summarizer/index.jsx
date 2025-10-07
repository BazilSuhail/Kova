import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Uniwind, useUniwind } from 'uniwind';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Custom Header for BottomSheet
const FilePickerModalHeader = () => {
  return (
    <View className="px-6 pt-3 pb-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-emerald-500 dark:bg-emerald-700 rounded-lg items-center justify-center mr-3">
          <Ionicons name="document-attach" size={18} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">Upload PDF Notes</Text>
          <Text className="text-sm text-gray-500">Select a PDF file to summarize</Text>
        </View>
      </View>
    </View>
  )
};

export default function NoteSummarizerScreen() {
  const { theme } = useUniwind();
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [summary, setSummary] = useState({
    title: '',
    keyPoints: [],
    mainTopics: [],
    estimatedReadTime: '',
  });

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [showModal]);

  const handleBackPress = () => {
    if (showModal) {
      handleCloseModal();
      return true;
    }
    return false;
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    router.back();
  }, [router]);

  const pickPdf = async () => {
    setUploadError('');
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: false,
    });

    if (result.canceled) {
      return;
    }

    const file = result.assets?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setUploadError('Please upload a file smaller than 2 MB.');
      return;
    }

    setSelectedPdf(file);
  };

  const uploadPdf = useCallback(() => {
    if (!selectedPdf) return;

    setLoading(true);
    setShowModal(false);

    // Simulate PDF processing and summarization (3 sec)
    setTimeout(() => {
      const dummySummary = {
        title: selectedPdf.name.replace('.pdf', ''),
        keyPoints: [
          'Main concept: Understanding React Native fundamentals',
          'Key feature: Cross-platform mobile development',
          'Important note: JavaScript bridge architecture',
          'Best practice: Component-based development approach',
          'Performance tip: Optimize rendering with FlatList'
        ],
        mainTopics: ['React Native', 'Mobile Development', 'JavaScript', 'Components'],
        estimatedReadTime: '5-7 minutes',
      };
      setSummary(dummySummary);
      setLoading(false);
    }, 3000);
  }, [selectedPdf]);

  const handleRegenerate = useCallback(() => {
    setSummary({
      title: '',
      keyPoints: [],
      mainTopics: [],
      estimatedReadTime: '',
    });
    setSelectedPdf(null);
    setShowModal(true);
  }, []);

  const handleSave = useCallback(() => {
    console.log('✅ Summary Saved:', summary);
    Alert.alert('Saved', 'Summary saved successfully');
  }, [summary]);

  // Loading animation effect
  useEffect(() => {
    if (loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [loading]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar
        barStyle={theme === 'dark' ? "light-content" : "dark-content"}
        backgroundColor={theme === 'dark' ? "#111827" : "#FFFFFF"}
      />
      {/* Summary Review Screen - Always rendered behind modal */}
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-16 pb-8">
          {/* Header */}
          <View className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl py-4 px-6 mb-8 border border-emerald-200 dark:border-emerald-800">
            <View className="flex-row items-center">
              <View className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="checkmark-circle" size={32} color={theme === 'dark' ? "#34D399" : "#059669"} />
              </View>
              <View className="flex-col flex-1">
                <Text className="text-xl font-bold text-emerald-700 dark:text-white mb-1">
                  {summary.title ? 'Summary Ready' : 'Generate PDF Summary'}
                </Text>
                <Text className="text-emerald-700 dark:text-gray-400 text-[11px]">
                  {summary.title
                    ? 'AI has analyzed your PDF and created a comprehensive summary.'
                    : 'Select a PDF file to get started with AI-powered summarization'}
                </Text>
              </View>
            </View>
          </View>

          {/* Summary Content */}
          <View style={{ gap: 24 }}>
            {/* Document Title */}
            <View>
              <View className="flex-row items-center mb-3">
                <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="document" size={14} color={theme === 'dark' ? "#34D399" : "#059669"} />
                </View>
                <Text className="text-gray-800 dark:text-white font-semibold">Document Title</Text>
              </View>
              <View className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <Text className="text-md font-bold font-italic text-emerald-800 dark:text-emerald-400">
                  {summary.title || '* No document selected'}
                </Text>
              </View>
            </View>

            {/* Key Points */}
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="list" size={14} color={theme === 'dark' ? "#34D399" : "#059669"} />
                  </View>
                  <Text className="text-gray-800 dark:text-white font-semibold">Key Points</Text>
                </View>
                {/* AI Credit Footer */}
                <View className="items-center">
                  <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Ionicons name="sparkles" size={15} color={theme === 'dark' ? "#34D399" : "#059669"} />
                    <Text className="text-emerald-700 dark:text-emerald-400 text-[11px] font-medium ml-2">
                      Summarized by AI
                    </Text>
                  </View>
                </View>
              </View>
              <View className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                {summary.keyPoints.length > 0 ? (
                  summary.keyPoints.map((point, index) => (
                    <View key={index} className="flex-row items-start mb-3 last:mb-0">
                      <View className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <Text className="text-gray-800 dark:text-gray-300 leading-6 flex-1">{point}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 dark:text-gray-400 italic">
                    {selectedPdf
                      ? 'Processing your document...'
                      : 'Key points will appear here after processing'}
                  </Text>
                )}
              </View>
            </View>

            {/* Main Topics */}
            <View>
              <View className="flex-row items-center mb-3">
                <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="pricetags" size={14} color={theme === 'dark' ? "#34D399" : "#059669"} />
                </View>
                <Text className="text-gray-800 dark:text-white font-semibold">Main Topics</Text>
              </View>
              <View className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                {summary.mainTopics.length > 0 ? (
                  <View style={{ gap: 4 }} className="flex-row flex-wrap">
                    {summary.mainTopics.map((topic, index) => (
                      <View key={index} className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
                        <Text className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">{topic}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-500 dark:text-gray-400 italic">
                    {selectedPdf
                      ? 'Extracting main topics...'
                      : 'Topics will appear here after processing'}
                  </Text>
                )}
              </View>
            </View>

            {/* Reading Time */}
            <View>
              <View className="flex-row items-center mb-3">
                <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="time" size={14} color={theme === 'dark' ? "#34D399" : "#059669"} />
                </View>
                <Text className="text-gray-800 dark:text-white font-semibold">Estimated Reading Time</Text>
              </View>
              <View className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <Text className="text-gray-800 dark:text-white text-base">
                  {summary.estimatedReadTime || 'Calculating...'}
                </Text>
              </View>
            </View>
          </View>

          <View className='w-full h-[2px] bg-gray-200 dark:bg-gray-700 rounded-2xl mt-6' />

          {/* Action Buttons */}
          <View style={{ gap: 12 }} className="flex-row mt-8">
            <TouchableOpacity
              onPress={handleSave}
              className="bg-emerald-600 flex-1 py-4 rounded-xl items-center flex-row justify-center"
              activeOpacity={0.8}
              disabled={!summary.title}
            >
              <Ionicons name="bookmark" size={20} color="white" />
              <Text className="text-white text-base font-semibold ml-2">
                {summary.title ? 'Save Summary' : 'Save (Unavailable)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRegenerate}
              className="bg-white dark:bg-gray-800 px-5 py-4 rounded-xl items-center flex-row justify-center border border-gray-200 dark:border-gray-700"
            >
              <Ionicons name="refresh" size={18} color={theme === 'dark' ? "#9CA3AF" : "#6B7280"} />
              <Text className="text-gray-700 dark:text-gray-300 font-medium ml-2">New File</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { }}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl items-center flex-row justify-center border border-gray-200 dark:border-gray-700"
              disabled={!summary.title}
            >
              <Ionicons name="share-outline" size={22} color={theme === 'dark' ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* PDF Picker BottomSheet */}
      <BottomSheet
        visible={showModal}
        onClose={handleCloseModal}
        header={<FilePickerModalHeader />}
        heightRatio={uploadError || selectedPdf ? 0.72 : 0.60}
        draggableAreaColor={theme === 'dark' ? '#1f2937' : 'white'}
        dragHandleColor={theme === 'dark' ? '#4b5563' : '#ccc'}
        statusBarColor={theme === 'dark' ? '#070A10' : '#00000066'}
        statusBarStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      >
        <View className="px-6 pt-6 pb-8 flex-1 bg-white dark:bg-gray-800">
          {/* Error Message */}
          {uploadError ? (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-6 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="alert-circle-outline" size={20} color={theme === 'dark' ? "#F87171" : "#dc2626"} />
                <Text className="text-red-800 dark:text-red-400 font-semibold ml-3 flex-1">{uploadError}</Text>
              </View>
            </View>
          ) : selectedPdf ? (
            <View className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center">
                <View className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="checkmark-circle" size={24} color={theme === 'dark' ? "#34D399" : "#059669"} />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">FILE SELECTED</Text>
                  <View className="flex-row items-center" style={{ gap: 6 }}>
                    <Text className="text-[13px] font-bold text-gray-900 dark:text-white mb-1">
                      {selectedPdf.name.slice(0, 15)}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      Size: {(selectedPdf.size / 1024).toFixed(1)} KB
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}


          {/* File Picker Section */}
          <View className="flex-1">
            <TouchableOpacity
              onPress={pickPdf}
              className="p-6 rounded-3xl mb-6 bg-emerald-600"
              activeOpacity={0.9}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-emerald-500 rounded-xl items-center justify-center mr-5">
                  <Ionicons name="document-attach-outline" size={22} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-[16px] font-bold text-white mb-1">
                    {selectedPdf ? 'Change PDF File' : 'Select PDF File'}
                  </Text>
                  <Text className="text-emerald-100 text-[11px]">Choose from your device storage</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </View>
            </TouchableOpacity>

            {/* Info Cards */}
            <View style={{ gap: 12 }} className="mb-8">
              {[
                { icon: 'shield-checkmark-outline', text: 'Secure & Private Processing' },
                { icon: 'speedometer-outline', text: 'Fast AI-Powered Analysis' },
                { icon: 'resize-outline', text: 'Files up to 2MB supported' }
              ].map((info, idx) => (
                <View key={idx} className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-[12px] border border-emerald-200 dark:border-emerald-800">
                  <Ionicons name={info.icon} size={18} color={theme === 'dark' ? "#9CA3AF" : "#10B981"} />
                  <Text className="text-sm text-emerald-600 font-[500] dark:text-gray-300 ml-3">{info.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }} className="flex-row">
            <TouchableOpacity
              className="flex-1 bg-gray-100 dark:bg-gray-700 py-4 rounded-2xl items-center border border-gray-200 dark:border-gray-600"
              onPress={handleCloseModal}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-4 px-3 rounded-2xl items-center flex-row justify-center ${selectedPdf
                ? 'bg-emerald-600'
                : 'bg-gray-200 dark:bg-gray-700'
                }`}
              onPress={uploadPdf}
              disabled={!selectedPdf}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={selectedPdf ? "white" : (theme === 'dark' ? "#9CA3AF" : "#6B7280")}
              />
              <Text className={`font-semibold ml-2 ${selectedPdf ? 'text-white' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                }`}>
                Generate Summary
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>

      {/* Loading State - Overlay */}
      {loading && (
        <Animated.View
          className="absolute inset-0 justify-center items-center px-8 bg-gray-50 dark:bg-gray-900"
          style={{ opacity: fadeAnim }}
        >
          <View className="items-center">
            {/* Animated Icon Container */}
            <View className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-800">
              <Ionicons name="document-text-outline" size={40} color={theme === 'dark' ? "#34D399" : "#059669"} />
            </View>

            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processing PDF...</Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mb-8 leading-6 max-w-xs">
              AI is reading your document and extracting key insights for summarization
            </Text>

            <ActivityIndicator size="large" color={theme === 'dark' ? "#34D399" : "#059669"} />

            {/* Progress Steps */}
            <View style={{ gap: 12 }} className="mt-8 w-full max-w-xs">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                <Text className="text-sm text-gray-700 dark:text-gray-300">Reading PDF content</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-emerald-300 dark:bg-emerald-600 rounded-full mr-3" />
                <Text className="text-sm text-gray-600 dark:text-gray-400">Analyzing key points</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-3" />
                <Text className="text-sm text-gray-500 dark:text-gray-500">Generating summary</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
