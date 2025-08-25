import { FontAwesome, Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Dummy data for saved PDF summaries
const dummyPdfSummaries = [
  {
    id: '1',
    fileName: 'React Native Fundamentals.pdf',
    title: 'React Native Development Guide',
    keyPoints: [
      'Understanding React Native architecture and components',
      'JavaScript bridge communication patterns',
      'Cross-platform development best practices',
      'Performance optimization techniques',
      'Navigation and state management'
    ],
    mainTopics: ['React Native', 'Mobile Development', 'JavaScript', 'Performance'],
    estimatedReadTime: '8-10 minutes',
    uploadDate: '2025-08-25',
    fileSize: '1.2 MB'
  },
  {
    id: '2',
    fileName: 'Machine Learning Basics.pdf',
    title: 'Introduction to Machine Learning',
    keyPoints: [
      'Supervised vs unsupervised learning concepts',
      'Common algorithms and their applications',
      'Data preprocessing and feature engineering',
      'Model evaluation and validation techniques',
      'Overfitting prevention strategies'
    ],
    mainTopics: ['Machine Learning', 'AI', 'Data Science', 'Algorithms'],
    estimatedReadTime: '12-15 minutes',
    uploadDate: '2025-08-23',
    fileSize: '850 KB'
  },
  {
    id: '3',
    fileName: 'Design Systems Guide.pdf',
    title: 'Building Scalable Design Systems',
    keyPoints: [
      'Design system principles and foundations',
      'Component library architecture',
      'Design tokens and consistency standards',
      'Documentation and team collaboration',
      'Implementation across different platforms'
    ],
    mainTopics: ['Design Systems', 'UI/UX', 'Frontend', 'Design Tokens'],
    estimatedReadTime: '6-8 minutes',
    uploadDate: '2025-08-20',
    fileSize: '2.1 MB'
  },
  {
    id: '4',
    fileName: 'API Security Best Practices.pdf',
    title: 'Securing RESTful APIs',
    keyPoints: [
      'Authentication and authorization mechanisms',
      'Rate limiting and throttling strategies',
      'Input validation and sanitization',
      'HTTPS and data encryption protocols',
      'API versioning and documentation security'
    ],
    mainTopics: ['API Security', 'Backend', 'Authentication', 'Encryption'],
    estimatedReadTime: '10-12 minutes',
    uploadDate: '2025-08-18',
    fileSize: '1.8 MB'
  }
];

// Custom Header for Detail Modal
const SummaryDetailHeader = ({ fileName, isDark }) => (
  <View className="px-6 pt-3 pb-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
    <View className="flex-row items-center">
      <View className="w-10 h-10 bg-emerald-500 rounded-lg items-center justify-center mr-3">
        <Ionicons name="document-text" size={16} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Summary Details</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">{fileName}</Text>
      </View>
    </View>
  </View>
);

export default function PdfSummariesScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter summaries based on search query
  const filteredSummaries = dummyPdfSummaries.filter(summary =>
    summary.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.mainTopics.some(topic =>
      topic.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSummaryPress = useCallback((summary) => {
    setSelectedSummary(summary);
    setShowDetailModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedSummary(null);
  }, []);

  const handleDeleteSummary = useCallback((summaryId) => {
    Alert.alert(
      'Delete Summary',
      'Are you sure you want to delete this summary?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Deleting summary:', summaryId);
            Alert.alert('Deleted', 'Summary deleted successfully');
          }
        }
      ]
    );
  }, []);

  const handleShareSummary = useCallback((summary) => {
    console.log('Sharing summary:', summary.title);
    Alert.alert('Share', 'Share functionality would open here');
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar
        barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === 'dark' ? "#111827" : "#FFFFFF"}
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top + 20 }}
      >
        {/* Header Section */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">My Summaries</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                {filteredSummaries.length} PDF{filteredSummaries.length !== 1 ? 's' : ''} summarized
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/upload')}
              className="w-12 h-12 bg-emerald-600 rounded-xl items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="relative mb-6">
            <View className="absolute left-4 top-4 z-10">
              <Ionicons name="search" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search summaries..."
              className="bg-white dark:bg-gray-800 pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </View>

          {/* Stats Cards */}
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <View className="flex-row items-center">
                <Ionicons name="documents" size={20} color={isDark ? "#34D399" : "#059669"} />
                <Text className="text-emerald-700 dark:text-emerald-400 font-semibold ml-2">Total Files</Text>
              </View>
              <Text className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-2">
                {dummyPdfSummaries.length}
              </Text>
            </View>
            <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color={isDark ? "#60A5FA" : "#2563eb"} />
                <Text className="text-blue-700 dark:text-blue-400 font-semibold ml-2">Avg. Read</Text>
              </View>
              <Text className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-2">9 min</Text>
            </View>
          </View>
        </View>

        {/* Summaries List */}
        <View className="px-6">
          {filteredSummaries.length > 0 ? (
            <View style={{ gap: 16 }}>
              {filteredSummaries.map((summary) => (
                <TouchableOpacity
                  key={summary.id}
                  onPress={() => handleSummaryPress(summary)}
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700"
                  activeOpacity={0.7}
                >
                  {/* Header Row */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                        {summary.title}
                      </Text>
                      <View className="flex-row items-center" style={{ gap: 8 }}>
                        <Ionicons name="document" size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                          {summary.fileName}
                        </Text>
                      </View>
                    </View>
                    <View className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl items-center justify-center">
                      <Ionicons name="document-text" size={18} color={isDark ? "#34D399" : "#059669"} />
                    </View>
                  </View>

                  {/* Key Points Preview */}
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Points:</Text>


                    {summary.keyPoints.slice(0, 2).map((point, index) => (
                      <View key={index} className="flex-row items-start mb-1">
                        <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1" numberOfLines={1}>
                          {point}
                        </Text>
                      </View>
                    ))}
                    {summary.keyPoints.length > 2 && (
                      <Text className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        +{summary.keyPoints.length - 2} more points
                      </Text>
                    )}
                  </View>

                  {/* Topics Tags */}
                  <View className="flex-row flex-wrap mb-4" style={{ gap: 6 }}>
                    {summary.mainTopics.slice(0, 3).map((topic, index) => (
                      <View key={index} className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                        <Text className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{topic}</Text>
                      </View>
                    ))}
                    {summary.mainTopics.length > 3 && (
                      <View className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full border border-gray-100 dark:border-gray-600">
                        <Text className="text-xs text-gray-500 dark:text-gray-400">+{summary.mainTopics.length - 3}</Text>
                      </View>
                    )}
                  </View>

                  {/* Footer Info */}
                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-center" style={{ gap: 12 }}>
                      <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">{formatDate(summary.uploadDate)}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">{summary.estimatedReadTime}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleShareSummary(summary)}
                        className="w-8 h-8 bg-gray-50 dark:bg-gray-700 rounded-lg items-center justify-center"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="share-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteSummary(summary.id)}
                        className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg items-center justify-center"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={14} color={isDark ? "#F87171" : "#DC2626"} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center py-12">
              <View className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="search" size={32} color={isDark ? "#9CA3AF" : "#6B7280"} />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No summaries found</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                {searchQuery ? 'Try adjusting your search terms' : 'Upload your first PDF to get started'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <BottomSheet
        visible={showDetailModal}
        onClose={handleCloseModal}
        header={<SummaryDetailHeader fileName={selectedSummary?.fileName} isDark={isDark} />}
        heightRatio={0.85}
        draggableAreaColor={colorScheme === 'dark' ? '#1f2937' : 'white'}
        dragHandleColor={colorScheme === 'dark' ? '#4b5563' : '#ccc'}
        statusBarColor={colorScheme === 'dark' ? '#070A10' : '#00000066'}
        statusBarStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      >
        {selectedSummary && (
          <ScrollView
            className="flex-1 px-6 pt-6 bg-white dark:bg-gray-800"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* File Info Card */}
            <View className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 mb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    {selectedSummary.title}
                  </Text>
                  <View style={{ gap: 8 }}>
                    <View className="flex-row items-center">
                      <Ionicons name="document" size={12} color={isDark ? "#34D399" : "#059669"} />
                      <Text className="text-sm text-emerald-700 dark:text-emerald-400 ml-2">{selectedSummary.fileName}</Text>
                    </View>
                    <View className="flex-row items-center" style={{ gap: 16 }}>
                      <View className="flex-row items-center">
                        <Ionicons name="resize" size={12} color={isDark ? "#34D399" : "#059669"} />
                        <Text className="text-sm text-emerald-700 dark:text-emerald-400 ml-1">{selectedSummary.fileSize}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="calendar" size={12} color={isDark ? "#34D399" : "#059669"} />
                        <Text className="text-sm text-emerald-700 dark:text-emerald-400 ml-1">{formatDate(selectedSummary.uploadDate)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Key Points Section */}
            <View className="mb-6">


              <View className="mb-4 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="list" size={14} color={isDark ? "#34D399" : "#059669"} />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">Key Points</Text>
                </View>

                <View className="items-center">
                  <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Ionicons name="sparkles" size={15} color={isDark ? "#34D399" : "#059669"} />
                    <Text className="text-emerald-700 dark:text-emerald-400 text-xs font-medium ml-2">
                      Summarized by AI
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                {selectedSummary.keyPoints.map((point, index) => (
                  <View key={index} className="flex-row items-start mb-3 last:mb-0">
                    <View className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-4 flex-shrink-0" />
                    <Text className="text-gray-800 dark:text-gray-300 leading-6 flex-1">{point}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Main Topics Section */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="pricetags" size={14} color={isDark ? "#34D399" : "#059669"} />
                </View>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">Main Topics</Text>
              </View>
              <View className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {selectedSummary.mainTopics.map((topic, index) => (
                    <View key={index} className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
                      <Text className="text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">{topic}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Reading Time Section */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="time" size={14} color={isDark ? "#34D399" : "#059669"} />
                </View>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">Estimated Reading Time</Text>
              </View>
              <View className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                <Text className="text-gray-800 dark:text-white text-base font-medium">
                  {selectedSummary.estimatedReadTime}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ gap: 12 }}>


              <View className="flex-row" style={{ gap: 12 }}>

                <TouchableOpacity
                  onPress={() => handleShareSummary(selectedSummary)}
                  className="bg-emerald-600 flex-1 py-4 rounded-xl flex-row items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Ionicons name="share" size={18} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">Share Summary</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCloseModal}
                  className="bg-gray-100 dark:bg-gray-700 py-4 px-6 rounded-xl items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-medium">Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteSummary(selectedSummary.id)}
                  className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl items-center border border-red-200 dark:border-red-800"
                  activeOpacity={0.8}
                >
                  <FontAwesome
                    name="trash-o"
                    size={22}
                    color={colorScheme === 'dark' ? "#F87171" : "#dc2626"}
                  />
                </TouchableOpacity>
              </View>
            </View>


          </ScrollView>
        )}
      </BottomSheet>
    </View>
  );
}