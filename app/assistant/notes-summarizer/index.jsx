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
    <View className="flex-1 justify-center items-center bg-white">
      <View className="bg-white rounded-3xl p-8 mx-6 shadow-lg items-center">
        <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-6">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
        <Text className="text-xl font-bold text-gray-800 mb-2">Processing PDF</Text>
        <Text className="text-gray-600 text-center mb-4">Uploading for summarization...</Text>
        <View className="w-full bg-gray-200 rounded-full h-2">
          <View className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '50%' }} />
        </View>
      </View>
    </View>
  );

  if (loading) return <CustomLoader />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="items-center mb-10 mt-10">
          <Ionicons name="document-attach-outline" size={48} color="#6366f1" />
          <Text className="text-2xl font-bold text-gray-800 mt-4">Note Summarizer</Text>
          <Text className="text-gray-600 text-center mt-2 px-4">
            Upload your PDF notes and we'll generate a clean summary.
          </Text>
        </View>

        {/* File Info */}
        {selectedPdf && (
          <View className="bg-white p-5 rounded-2xl shadow-sm space-y-2">
            <Text className="text-base text-gray-800 font-semibold">Selected File:</Text>
            <Text className="text-sm text-gray-700">{selectedPdf.name}</Text>
            <Text className="text-xs text-gray-500">
              Size: {(selectedPdf.size / 1024).toFixed(1)} KB
            </Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          disabled={!selectedPdf}
          onPress={uploadPdf}
          className={`mt-10 p-4 rounded-2xl items-center ${
            selectedPdf ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white font-semibold text-lg">Upload PDF</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <BlurView intensity={20} className="flex-1">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setShowModal(false)} />
          <View
            className="bg-white rounded-t-3xl shadow-2xl"
            style={{ minHeight: screenHeight * 0.4, maxHeight: screenHeight * 0.7 }}
          >
            <View className="items-center pt-3 pb-6">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {uploadError ? (
              <View className="bg-red-100 border border-red-300 rounded-xl m-4 p-4 mb-4">
                <Text className="text-red-800 font-semibold text-center">{uploadError}</Text>
              </View>
            ) : null}

            {/* Modal Content */}
            <View className="px-6 pb-8">
              <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Upload PDF Notes
              </Text>
              <Text className="text-gray-600 mb-8 text-center">
                We'll summarize your notes into bullet points
              </Text>

              <TouchableOpacity
                onPress={pickPdf}
                className="flex-row items-center bg-indigo-50 p-6 rounded-2xl border border-indigo-100"
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 bg-indigo-600 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="document" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">Select PDF</Text>
                  <Text className="text-gray-600">Pick a file from your device</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="mt-6 py-4 items-center"
              >
                <Text className="text-gray-500 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}
