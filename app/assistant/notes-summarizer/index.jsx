import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export default function NoteSummarizerScreen() {
  const [showModal, setShowModal] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setShowModal(true);
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

  const uploadPdf = async () => {
    if (!selectedPdf) return;

    setLoading(true);

    // Simulated delay + preview
    setTimeout(() => {
      setLoading(false);
      console.log('📄 PDF URI:', selectedPdf.uri);
      console.log('📦 Size:', `${(selectedPdf.size / 1024).toFixed(1)} KB`);
      Alert.alert('Uploaded', 'PDF uploaded successfully (simulated)');
    }, 2000);
  };

  const CustomLoader = () => (
    <View className="flex-1 justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50">
      <View className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 mx-8 -2xl border border-white/20 items-center">
        <View className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl items-center justify-center mb-8 -lg">
          <ActivityIndicator size="large" color="white" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-3">Processing PDF</Text>
        <Text className="text-gray-600 text-center mb-6 text-base leading-relaxed">
          Analyzing your document for summarization...
        </Text>
        <View className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <View className="bg-gradient-to-r from-blue-500 to-violet-600 h-full rounded-full animate-pulse -sm" style={{ width: '65%' }} />
        </View>
      </View>
    </View>
  );

  if (loading) return <CustomLoader />;

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center mb-12 mt-8">
          <View className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl items-center justify-center mb-6 -lg">
            <Ionicons name="document-text-outline" size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-3">Note Summarizer</Text>
          <Text className="text-gray-600 text-center text-base leading-relaxed px-6 max-w-sm">
            Transform your PDF notes into clean, organized summaries powered by AI
          </Text>
        </View>

        {/* File Info Card */}
        {selectedPdf && (
          <View className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl -xl border border-white/20 mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-4">
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-green-700 mb-1">FILE SELECTED</Text>
                <Text className="text-lg font-bold text-gray-900">{selectedPdf.name}</Text>
              </View>
            </View>
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="document-outline" size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-600 ml-2">Size: {(selectedPdf.size / 1024).toFixed(1)} KB</Text>
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-blue-700">PDF</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          disabled={!selectedPdf}
          onPress={uploadPdf}
          className={`p-5 rounded-2xl items-center -lg ${
            selectedPdf 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 -green-500/25' 
              : 'bg-gray-200'
          }`}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Ionicons 
              name="cloud-upload-outline" 
              size={24} 
              color={selectedPdf ? "white" : "#9ca3af"} 
            />
            <Text className={`font-bold text-lg ml-3 ${
              selectedPdf ? 'text-white' : 'text-gray-500'
            }`}>
              {selectedPdf ? 'Generate Summary' : 'Select a PDF first'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Features Preview */}
        <View className="mt-12 space-y-4">
          <Text className="text-lg font-bold text-gray-900 mb-6 text-center">What you'll get:</Text>
          {[
            { icon: 'list-outline', title: 'Bullet Points', desc: 'Key information organized clearly' },
            { icon: 'flash-outline', title: 'Quick Insights', desc: 'Main concepts highlighted' },
            { icon: 'bookmark-outline', title: 'Easy Reference', desc: 'Perfect for studying & review' }
          ].map((feature, idx) => (
            <View key={idx} className="flex-row items-center bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
              <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-4">
                <Ionicons name={feature.icon} size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 mb-1">{feature.title}</Text>
                <Text className="text-sm text-gray-600">{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <BlurView intensity={30} className="flex-1">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setShowModal(false)} />
          <View
            className="bg-white/95 backdrop-blur-xl rounded-t-3xl -2xl border-t border-white/20"
            style={{ minHeight: screenHeight * 0.45, maxHeight: screenHeight * 0.75 }}
          >
            {/* Modal Handle */}
            <View className="items-center pt-4 pb-8">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {/* Error Message */}
            {uploadError ? (
              <View className="bg-red-50 border border-red-200 rounded-2xl mx-6 p-4 mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
                  <Text className="text-red-800 font-semibold ml-3 flex-1">{uploadError}</Text>
                </View>
              </View>
            ) : null}

            {/* Modal Content */}
            <View className="px-6 pb-10">
              <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
                Upload Your Notes
              </Text>
              <Text className="text-gray-600 mb-10 text-center text-base leading-relaxed">
                Select a PDF file and we'll create a comprehensive summary with key points and insights
              </Text>

              {/* File Picker Button */}
              <TouchableOpacity
                onPress={pickPdf}
                className="bg-gradient-to-r from-blue-500 to-violet-600 p-6 rounded-3xl -xl -blue-500/25 mb-6"
                activeOpacity={0.9}
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl items-center justify-center mr-5">
                    <Ionicons name="document-attach-outline" size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-white mb-1">Select PDF File</Text>
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

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="py-4 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-gray-500 font-semibold text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}