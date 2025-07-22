import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// OCR.space API configuration
const OCR_API_KEY = 'K86810809188957'; // Replace with your actual API key
const OCR_API_URL = 'https://api.ocr.space/parse/image';

const { height: screenHeight } = Dimensions.get('window');

export default function ImageProcessorScreen() {
    const [showModal, setShowModal] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState('');
    const [processingStep, setProcessingStep] = useState('');

    useEffect(() => {
        // Show modal when component mounts
        setShowModal(true);
    }, []);

    const pickImage = async () => {
        try {
            setShowModal(false); // Close modal immediately when option is selected

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera roll permissions are required!');
                setShowModal(true); // Re-open modal if permission denied
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });


            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedImage(result.assets[0]);
                await processImage(result.assets[0]);
            } else {
                setShowModal(true); // Re-open modal if selection was canceled
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to select image');
            setShowModal(true); // Re-open modal on error
        }
    };

    const takePhoto = async () => {
        try {
            setShowModal(false); // Close modal immediately when option is selected

            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permissions are required!');
                setShowModal(true); // Re-open modal if permission denied
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 4],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedImage(result.assets[0]);
                await processImage(result.assets[0]);
            } else {
                setShowModal(true); // Re-open modal if photo was canceled
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
            setShowModal(true); // Re-open modal on error
        }
    };

    const processImage = async (imageAsset) => {
        setLoading(true);
        setProcessingStep('Preparing image...');

        try {
            setProcessingStep('Uploading to OCR service...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            setProcessingStep('Extracting text from image...');
            const response = await callOCRAPI(imageAsset);
            setProcessingStep('ddd from image...');

            setProcessingStep('Processing results...');
            await new Promise(resolve => setTimeout(resolve, 500));

            if (response.success) {
                setApiResponse(response.text || 'No text found in the image.');
            } else {
                setApiResponse(`Error: ${response.error || 'Failed to process image'}`);
            }

        } catch (error) {
            console.error('OCR Error:', error);
            Alert.alert('Error', 'Failed to process image with OCR');
            setApiResponse('Failed to extract text from the image. Please try again with a clearer image.');
        } finally {
            setLoading(false);
            setProcessingStep('');
        }
    };

    const callOCRAPI = async (imageAsset) => {
        try {
            // Create FormData for OCR.space API
            const formData = new FormData();

            // Add the image file
            formData.append('file', {
                uri: imageAsset.uri,
                type: 'image/jpeg',
                name: 'image.jpg',
            });

            // Add API parameters according to OCR.space documentation
            formData.append('apikey', OCR_API_KEY);
            formData.append('language', 'eng'); // English language
            formData.append('isOverlayRequired', 'false'); // Don't need overlay info
            formData.append('detectOrientation', 'true'); // Auto-detect orientation
            formData.append('isTable', 'false'); // Set to true if processing tables
            formData.append('OCREngine', '2'); // Use OCR Engine 2 (more accurate)

            console.log('Sending request to OCR.space API...');

            const response = await fetch(OCR_API_URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // console.log('OCR API Response:', data);

            // Check if the API call was successful
            if (data.IsErroredOnProcessing) {
                return {
                    success: false,
                    error: data.ErrorMessage || 'OCR processing failed'
                };
            }

            // Extract text from all pages
            let extractedText = '';
            if (data.ParsedResults && data.ParsedResults.length > 0) {
                extractedText = data.ParsedResults.map(result =>
                    result.ParsedText || ''
                ).join('\n\n').trim();
            }

            return {
                success: true,
                text: extractedText || 'No text detected in the image.',
                confidence: data.ParsedResults?.[0]?.TextOverlay?.HasOverlay || false,
                originalResponse: data
            };

        } catch (error) {
            console.error('OCR API Error:', error);
            return {
                success: false,
                error: error.message || 'Network error occurred'
            };
        }
    };

    const createTaskFromText = () => {
        console.log('Creating task from text:', apiResponse);
        Alert.alert(
            'Task Created',
            `A new task has been created with the following text:\n\n${apiResponse}`,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
    };

    const resetApp = () => {
        setSelectedImage(null);
        setApiResponse('');
        setLoading(false);
        setShowModal(true);
    };

    const CustomLoader = () => (
        <View className="flex-1 justify-center items-center bg-white">
            <View className="bg-white rounded-3xl p-8 mx-6 shadow-lg items-center">
                <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-6">
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>

                <Text className="text-xl font-bold text-gray-800 mb-2">Extracting Text</Text>
                <Text className="text-gray-600 text-center mb-4">{processingStep}</Text>

                <View className="w-full bg-gray-200 rounded-full h-2">
                    <View className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                </View>
            </View>
        </View>
    );

    if (loading) {
        return <CustomLoader />;
    }

    if (apiResponse && selectedImage) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <ScrollView className="flex-1 px-6 py-4">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-2xl font-bold text-gray-800">Results</Text>
                        <TouchableOpacity
                            onPress={resetApp}
                            className="bg-indigo-600 px-4 py-2 rounded-full"
                        >
                            <Text className="text-white font-semibold">New Image</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Selected Image */}
                    <View className="mb-6">
                        <Image
                            source={{ uri: selectedImage.uri }}
                            className="w-full h-48 rounded-2xl"
                            resizeMode="cover"
                        />
                    </View>

                    {/* API Response */}
                    <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="document-text" size={24} color="#6366f1" />
                            <Text className="text-lg font-bold text-gray-800 ml-2">Extracted Text</Text>
                        </View>

                        <Text className="text-gray-700 leading-6 text-base">
                            {apiResponse}
                        </Text>
                    </View>

                    {/* Create Task Button */}
                    <TouchableOpacity
                        onPress={createTaskFromText}
                        className="bg-green-600 p-4 rounded-2xl items-center justify-center mt-4"
                    >
                        <Text className="text-white font-semibold text-lg">Create Task from Text</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Main Content - Minimal when modal is shown */}
            <View className="flex-1 justify-center items-center px-6">
                <View className="items-center">
                    <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-6">
                        <Ionicons name="image-outline" size={40} color="#6366f1" />
                    </View>

                    <Text className="text-2xl font-bold text-gray-800 mb-2">OCR Text Extractor</Text>
                    <Text className="text-gray-600 text-center">
                        Select an image to extract text using OCR technology
                    </Text>
                </View>
            </View>

            {/* Bottom Sheet Modal */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <BlurView intensity={20} className="flex-1">
                    <TouchableOpacity
                        className="flex-1"
                        activeOpacity={1}
                        onPress={() => setShowModal(false)}
                    />

                    <View
                        className="bg-white rounded-t-3xl shadow-2xl"
                        style={{
                            minHeight: screenHeight * 0.4,
                            maxHeight: screenHeight * 0.7
                        }}
                    >
                        {/* Handle */}
                        <View className="items-center pt-3 pb-6">
                            <View className="w-12 h-1 bg-gray-300 rounded-full" />
                        </View>

                        {/* Content */}
                        <View className="px-6 pb-8">
                            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                                Select Image Source
                            </Text>
                            <Text className="text-gray-600 mb-8 text-center">
                                Choose how you'd like to add your image
                            </Text>

                            {/* Options */}
                            <View className="space-y-4">
                                <TouchableOpacity
                                    onPress={takePhoto}
                                    className="flex-row items-center bg-indigo-50 p-6 rounded-2xl border border-indigo-100"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-12 h-12 bg-indigo-600 rounded-xl items-center justify-center mr-4">
                                        <Ionicons name="camera" size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">Take Photo</Text>
                                        <Text className="text-gray-600">Use your camera to capture an image</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={pickImage}
                                    className="flex-row items-center bg-green-50 p-6 rounded-2xl border border-green-100"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-12 h-12 bg-green-600 rounded-xl items-center justify-center mr-4">
                                        <Ionicons name="images" size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-gray-800">Choose from Gallery</Text>
                                        <Text className="text-gray-600">Select an existing image</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>

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