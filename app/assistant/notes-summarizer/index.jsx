import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Custom Header for BottomSheet
const FilePickerModalHeader = () => (
  <View className="px-6 pt-3 pb-4 border-b border-gray-100">
    <View className="flex-row items-center">
      <View className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg items-center justify-center mr-3">
        <Ionicons name="document-attach" size={16} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">Upload PDF Notes</Text>
        <Text className="text-sm text-gray-500">Select a PDF file to summarize</Text>
      </View>
    </View>
  </View>
);

export default function NoteSummarizerScreen() {
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

  useEffect(() => {
    setShowModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

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

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View className="flex-1 bg-white">
        {/* PDF Picker BottomSheet */}
        <BottomSheet 
          visible={showModal}
          onClose={handleCloseModal}
          header={<FilePickerModalHeader />}
          heightRatio={0.65}
        >
          <View className="px-6 pt-6 pb-8 flex-1">
            {/* Error Message */}
            {uploadError ? (
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
                  <Text className="text-red-800 font-semibold ml-3 flex-1">{uploadError}</Text>
                </View>
              </View>
            ) : null}

            {/* Selected File Display */}
            {selectedPdf && (
              <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="checkmark-circle" size={24} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-green-700 mb-1">FILE SELECTED</Text>
                    <Text className="text-base font-bold text-gray-900 mb-1">{selectedPdf.name}</Text>
                    <Text className="text-sm text-gray-600">Size: {(selectedPdf.size / 1024).toFixed(1)} KB</Text>
                  </View>
                </View>
              </View>
            )}

            {/* File Picker Section */}
            <View className="flex-1">
              <TouchableOpacity
                onPress={pickPdf}
                className="bg-gradient-to-r from-blue-500 to-violet-600 p-6 rounded-3xl shadow-xl shadow-blue-500/25 mb-6"
                activeOpacity={0.9}
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl items-center justify-center mr-5">
                    <Ionicons name="document-attach-outline" size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-white mb-1">
                      {selectedPdf ? 'Change PDF File' : 'Select PDF File'}
                    </Text>
                    <Text className="text-blue-100 text-base">Choose from your device storage</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </View>
              </TouchableOpacity>

              {/* Info Cards */}
              <View className="space-y-3 mb-8">
                {[
                  { icon: 'shield-checkmark-outline', text: 'Secure & Private Processing' },
                  { icon: 'speedometer-outline', text: 'Fast AI-Powered Analysis' },
                  { icon: 'resize-outline', text: 'Files up to 2MB supported' }
                ].map((info, idx) => (
                  <View key={idx} className="flex-row items-center bg-gray-50 p-3 rounded-xl">
                    <Ionicons name={info.icon} size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-700 ml-3">{info.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-50 py-4 rounded-2xl items-center border border-gray-200"
                onPress={handleCloseModal}
              >
                <Text className="text-gray-600 font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center ${
                  selectedPdf 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gray-200'
                }`}
                onPress={uploadPdf}
                disabled={!selectedPdf}
              >
                <Ionicons 
                  name="cloud-upload-outline" 
                  size={18} 
                  color={selectedPdf ? "white" : "#9CA3AF"} 
                />
                <Text className={`font-semibold ml-2 ${
                  selectedPdf ? 'text-white' : 'text-gray-400'
                }`}>
                  Generate Summary
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheet>

        {/* Loading State */}
        {loading && (
          <Animated.View 
            className="flex-1 justify-center items-center px-8 bg-white"
            style={{ opacity: fadeAnim }}
          >
            <View className="items-center">
              {/* Animated Icon Container */}
              <View className="w-24 h-24 bg-blue-50 rounded-3xl items-center justify-center mb-6 border border-blue-100">
                <Ionicons name="document-text-outline" size={40} color="#3b82f6" />
              </View>
              
              <Text className="text-2xl font-bold text-gray-900 mb-2">Processing PDF...</Text>
              <Text className="text-gray-500 text-center mb-8 leading-6 max-w-xs">
                AI is reading your document and extracting key insights for summarization
              </Text>
              
              <ActivityIndicator size="large" color="#3b82f6" />
              
              {/* Progress Steps */}
              <View className="mt-8 space-y-3 w-full max-w-xs">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  <Text className="text-sm text-gray-600">Reading PDF content</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-blue-300 rounded-full mr-3" />
                  <Text className="text-sm text-gray-500">Analyzing key points</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-gray-300 rounded-full mr-3" />
                  <Text className="text-sm text-gray-400">Generating summary</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Summary Review Screen */}
        {!loading && summary.title && (
          <ScrollView 
            className="flex-1 bg-gray-50" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="px-6 pt-16 pb-8">
              {/* Header */}
              <View className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-100">
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="checkmark-circle" size={32} color="#16a34a" />
                  </View>
                  <View className="flex-col flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-2">Summary Ready</Text>
                    <Text className="text-gray-600">
                      AI has analyzed your PDF and created a comprehensive summary.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Summary Content */}
              <View className="space-y-6">
                {/* Document Title */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <View className="w-6 h-6 bg-blue-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="document" size={14} color="#3b82f6" />
                    </View>
                    <Text className="text-gray-700 font-semibold">Document Title</Text>
                  </View>
                  <View className="bg-white p-4 rounded-xl border border-gray-200">
                    <Text className="text-lg font-bold text-gray-900">{summary.title}</Text>
                  </View>
                </View>

                {/* Key Points */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <View className="w-6 h-6 bg-blue-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="list" size={14} color="#3b82f6" />
                    </View>
                    <Text className="text-gray-700 font-semibold">Key Points</Text>
                  </View>
                  <View className="bg-white p-4 rounded-xl border border-gray-200">
                    {summary.keyPoints.map((point, index) => (
                      <View key={index} className="flex-row items-start mb-3 last:mb-0">
                        <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <Text className="text-gray-800 leading-6 flex-1">{point}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Main Topics */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <View className="w-6 h-6 bg-blue-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="pricetags" size={14} color="#3b82f6" />
                    </View>
                    <Text className="text-gray-700 font-semibold">Main Topics</Text>
                  </View>
                  <View className="bg-white p-4 rounded-xl border border-gray-200">
                    <View className="flex-row flex-wrap -m-1">
                      {summary.mainTopics.map((topic, index) => (
                        <View key={index} className="bg-blue-50 px-3 py-2 rounded-full m-1 border border-blue-100">
                          <Text className="text-blue-700 text-sm font-medium">{topic}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Reading Time */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <View className="w-6 h-6 bg-blue-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="time" size={14} color="#3b82f6" />
                    </View>
                    <Text className="text-gray-700 font-semibold">Estimated Reading Time</Text>
                  </View>
                  <View className="bg-white p-4 rounded-xl border border-gray-200">
                    <Text className="text-gray-800 text-base">{summary.estimatedReadTime}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="mt-8 space-y-4">
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-blue-600 py-4 rounded-xl items-center flex-row justify-center"
                  activeOpacity={0.8}
                >
                  <Ionicons name="bookmark" size={20} color="white" />
                  <Text className="text-white text-base font-semibold ml-2">Save Summary</Text>
                </TouchableOpacity>

                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={handleRegenerate}
                    className="flex-1 bg-white py-4 rounded-xl items-center flex-row justify-center border border-gray-200"
                  >
                    <Ionicons name="refresh" size={18} color="#6B7280" />
                    <Text className="text-gray-700 font-medium ml-2">New File</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => {}}
                    className="flex-1 bg-white py-4 rounded-xl items-center flex-row justify-center border border-gray-200"
                  >
                    <Ionicons name="share-outline" size={18} color="#6B7280" />
                    <Text className="text-gray-700 font-medium ml-2">Share</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* AI Credit Footer */}
              <View className="mt-8 items-center">
                <View className="flex-row items-center bg-blue-50 px-4 py-3 rounded-full border border-blue-100">
                  <Ionicons name="sparkles" size={16} color="#3b82f6" />
                  <Text className="text-blue-700 text-sm font-medium ml-2">
                    Summarized by AI
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Default State - Show when no modal and no loading */}
        {!showModal && !loading && !summary.title && (
          <View className="flex-1 justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50 px-8">
            <View className="items-center">
              <View className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl items-center justify-center mb-6 shadow-lg">
                <Ionicons name="document-text-outline" size={32} color="white" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-3">Note Summarizer</Text>
              <Text className="text-gray-600 text-center text-base leading-relaxed mb-8 max-w-sm">
                Transform your PDF notes into clean, organized summaries powered by AI
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-violet-600 px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25"
                activeOpacity={0.9}
              >
                <Text className="text-white font-bold text-lg">Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </>
  );
}