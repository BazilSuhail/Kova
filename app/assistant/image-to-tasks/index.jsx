import CustomLoader from '@/components/image-tasks/ImageLoader';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// not used
const OCR_API_KEY = 'VnmrCwmOBgTr4+a/hOslNA==L2priItqKC6yrESn';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function ImageProcessorScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets()
    const [showModal, setShowModal] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState('');
    const [processingStep, setProcessingStep] = useState('');
    const [imageError, setImageError] = useState('');
    const [progress, setProgress] = useState(0);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setShowModal(true);
        // Animate entrance
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    useEffect(() => {
        if (loading) {
            Animated.timing(progressAnim, {
                toValue: progress / 100,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    }, [progress, loading]);

    const pickImage = async () => {
        try {
            setShowModal(false);
            setImageError('');

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'We need access to your photo library to select images.',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(true) },
                        { text: 'Open Settings', onPress: () => setShowModal(true) }
                    ]
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageAsset = result.assets[0];
                if (imageAsset.fileSize && imageAsset.fileSize > 200 * 1024) {
                    const fileSizeInBytes = imageAsset.fileSize;
                    const fileSizeFormatted = fileSizeInBytes >= 1024 * 1024
                        ? `${(fileSizeInBytes / (1024 * 1024)).toFixed(2)} MB`
                        : `${(fileSizeInBytes / 1024).toFixed(1)} KB`;

                    setImageError(`Image size is ${fileSizeFormatted}, which exceeds our 200 KB limit. Please choose a smaller image for optimal processing.`);
                    setShowModal(true);
                    return;
                }

                setSelectedImage(imageAsset);
                await processImage(imageAsset);
            } else {
                setShowModal(true);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Oops!', 'Something went wrong while selecting the image. Please try again.');
            setShowModal(true);
        }
    };

    const takePhoto = async () => {
        try {
            setShowModal(false);
            setImageError('');

            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Camera Permission Required',
                    'We need camera access to take photos.',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(true) },
                        { text: 'Open Settings', onPress: () => setShowModal(true) }
                    ]
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 4],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageAsset = result.assets[0];
                if (imageAsset.fileSize && imageAsset.fileSize > 200 * 1024) {
                    const fileSizeInBytes = imageAsset.fileSize;
                    const fileSizeFormatted = fileSizeInBytes >= 1024 * 1024
                        ? `${(fileSizeInBytes / (1024 * 1024)).toFixed(2)} MB`
                        : `${(fileSizeInBytes / 1024).toFixed(1)} KB`;

                    setImageError(`Image size is ${fileSizeFormatted}, which exceeds our 200 KB limit. Please retake with lower quality.`);
                    setShowModal(true);
                    return;
                }

                setSelectedImage(imageAsset);
                await processImage(imageAsset);
            } else {
                setShowModal(true);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Camera Error', 'Failed to take photo. Please try again.');
            setShowModal(true);
        }
    };

    const processImage = async (imageAsset) => {
        setLoading(true);
        setProgress(0);

        const steps = [
            { step: 'Analyzing image quality...', progress: 20 },
            { step: 'Preparing for OCR processing...', progress: 40 },
            { step: 'Extracting text from image...', progress: 70 },
            { step: 'Processing and formatting results...', progress: 90 },
            { step: 'Finalizing...', progress: 100 }
        ];

        try {
            for (let i = 0; i < steps.length; i++) {
                setProcessingStep(steps[i].step);
                setProgress(steps[i].progress);
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            const response = await callOCRAPI(imageAsset);

            if (response.success) {
                setApiResponse(response.text || 'No text was detected in this image. Try with a clearer image containing text.');
            } else {
                setApiResponse(`Processing failed: ${response.error || 'Unable to extract text from this image.'}`);
            }

        } catch (error) {
            console.error('OCR Error:', error);
            setApiResponse('Failed to process the image. Please ensure the image contains clear, readable text and try again.');
        } finally {
            setLoading(false);
            setProcessingStep('');
            setProgress(0);
        }
    };

    const callOCRAPI = async (imageAsset) => {
        try {
            console.log("Processing image with OCR...");
            console.log("Image size:", imageAsset.fileSize);

            const formData = new FormData();
            formData.append('image', {
                uri: imageAsset.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });

            const response = await fetch('https://api.api-ninjas.com/v1/imagetotext', {
                method: 'POST',
                headers: {
                    'X-Api-Key': '',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            const combinedText = Array.isArray(data)
                ? data.map(item => item.text).join(' ')
                : JSON.stringify(data);

            return { success: true, text: combinedText, originalResponse: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const createTaskFromText = () => {
        console.log('Creating task from text:', apiResponse);
        Alert.alert(
            'Task Created Successfully! 🎉',
            'Your extracted text has been converted into a task and added to your task list.',
            [
                { text: 'View Tasks', onPress: () => console.log('Navigate to tasks') },
                { text: 'Create Another', onPress: resetApp }
            ]
        );
    };

    const resetApp = () => {
        setSelectedImage(null);
        setApiResponse('');
        setLoading(false);
        setProgress(0);
        setProcessingStep('');
        setImageError('');
        setShowModal(true);
    };

    if (loading) {
        return (
            <CustomLoader
                fadeAnim={fadeAnim}
                scaleAnim={scaleAnim}
                progressAnim={progressAnim}
                processingStep={processingStep}
                progress={progress}
            />
        );
    }

    if (apiResponse || selectedImage) {
        return (
            <ScrollView className="flex-1 bg-gray-50"
                contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top }}
                showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-4 pb-8">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <Text className="text-2xl font-bold text-gray-800">Text Extracted</Text>
                            <Text className="text-gray-500 mt-1">Review and create task</Text>
                        </View>
                        <TouchableOpacity
                            onPress={resetApp}
                            className="bg-emerald-600 px-4 py-2 rounded-full shadow-lg shadow-emerald-200"
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="add-outline" size={16} color="white" />
                                <Text className="text-white font-semibold ml-1">New</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Selected Image Card */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-100 mb-6">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="image-outline" size={20} color="#10b981" />
                            <Text className="text-lg font-semibold text-gray-800 ml-2">Source Image</Text>
                        </View>
                        <Image
                            source={{ uri: selectedImage.uri }}
                            className="w-full h-48 rounded-xl"
                            resizeMode="cover"
                        />
                        <View className="mt-3 flex-row items-center">
                            <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                            <Text className="text-sm text-gray-600">Successfully processed</Text>
                        </View>
                    </View>

                    {/* Extracted Text Card */}
                    <View className="bg-white rounded-2xl p-6 shadow-sm shadow-gray-100 mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <Ionicons name="document-text-outline" size={20} color="#10b981" />
                                <Text className="text-lg font-semibold text-gray-800 ml-2">Extracted Text</Text>
                            </View>
                            <View className="bg-emerald-100 px-3 py-1 rounded-full">
                                <Text className="text-emerald-700 text-xs font-medium">Success</Text>
                            </View>
                        </View>

                        <View className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <Text className="text-gray-700 leading-6 text-base">
                                {apiResponse}
                            </Text>
                        </View>

                        <View className="mt-4 flex-row items-center">
                            <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
                            <Text className="text-sm text-gray-500 ml-2">
                                Text extracted using OCR technology
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="space-y-3">
                        <TouchableOpacity
                            onPress={createTaskFromText}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200"
                            activeOpacity={0.9}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                                <Text className="text-white font-semibold text-lg ml-2">Create Task from Text</Text>
                            </View>
                        </TouchableOpacity>

                        <View className="flex-row" style={{ gap: 12 }}>
                            <TouchableOpacity
                                className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-2xl items-center justify-center"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="copy-outline" size={18} color="#6B7280" />
                                    <Text className="text-gray-500 font-medium ml-2">Copy Text</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-2xl items-center justify-center"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="share-outline" size={18} color="#6B7280" />
                                    <Text className="text-gray-500 font-medium ml-2">Share</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50"
            contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top }}
            showsVerticalScrollIndicator={false}>
            {/* Main Content */}
            <Animated.View
                className="flex-1 justify-center items-center px-6"
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }}
            >
                <View className="items-center">
                    <View className="w-24 h-24 bg-emerald-500 rounded-3xl items-center justify-center mb-6">
                        <Ionicons name="scan-outline" size={40} color="white" />
                    </View>

                    <Text className="text-3xl font-bold text-gray-800 mb-3">OCR Text Extractor</Text>
                    <Text className="text-gray-600 text-center leading-6 max-w-sm">
                        Transform images into editable text using advanced OCR technology
                    </Text>

                    {/* Feature highlights */}
                    <View className="mt-8" style={{ gap: 12 }}>
                        {[
                            { icon: 'flash-outline', text: 'Lightning fast processing' },
                            { icon: 'shield-checkmark-outline', text: 'Secure & private' },
                            { icon: 'sparkles-outline', text: 'AI-powered accuracy' }
                        ].map((feature, index) => (
                            <View key={index} className="flex-row items-center">
                                <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-3">
                                    <Ionicons name={feature.icon} size={16} color="#10b981" />
                                </View>
                                <Text className="text-gray-600 font-medium">{feature.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Animated.View>

            {/* Bottom Sheet Modal */}
            <BottomSheet
                visible={showModal}
                heightRatio={imageError ? 0.72 : 0.55}
                header={
                    <View className="px-4 flex-row justify- items-center pb-5 pt-3 border-b-[2px] border-gray-200">
                        <View className="w-12 h-12 mr-[15px] bg-emerald-100 rounded-2xl items-center justify-center">
                            <Ionicons name="camera-outline" size={24} color="#10b981" />
                        </View>
                        <View className="">
                            <Text className="text-lg font-semibold text-gray-800">Select Image Source</Text>
                            <Text className="text-[11px] text-gray-500 mt-0.5">Choose how you'd like to add your image</Text>
                        </View>
                    </View>
                }
                onClose={() => {
                    setShowModal(false);
                    router.back();
                }}
            >
                <View
                    className="bg-white rounded-t-3xl flex-1"
                    style={{
                        minHeight: screenHeight * 0.4,
                        maxHeight: screenHeight * 0.7
                    }}
                >
                    {/* Error Message */}
                    {imageError ? (
                        <View className="mx-4 mt-4">
                            <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <View className="flex-row items-start" style={{ gap: 12 }}>
                                    <View className="w-6 h-6 bg-red-100 rounded-full items-center justify-center">
                                        <Ionicons name="warning-outline" size={14} color="#DC2626" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-red-800 font-medium mb-1">Image Too Large</Text>
                                        <Text className="text-red-700 text-sm">{imageError}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : null}

                    {/* Content */}
                    <View className="px-4 py-6 flex-1">

                        {/* Options */}
                        <View style={{ gap: 12 }}>
                            {/* Take Photo Option */}
                            <TouchableOpacity
                                onPress={takePhoto}
                                className="flex-row items-center bg-white border border-emerald-200 py-4 px-4 rounded-xl"
                                activeOpacity={0.7}
                            >
                                <View className="w-10 h-10 bg-emerald-500 rounded-xl items-center justify-center">
                                    <Ionicons name="camera" size={20} color="#ffffff" />
                                </View>
                                <View className="flex-1" style={{ marginLeft: 12 }}>
                                    <Text className="text-base font-semibold text-gray-800">Take Photo</Text>
                                    <Text className="text-gray-500 text-sm mt-0.5">Capture with camera</Text>
                                </View>
                                <View className="w-6 h-6 items-center justify-center">
                                    <Ionicons name="chevron-forward" size={16} color="#10b981" />
                                </View>
                            </TouchableOpacity>

                            {/* Gallery Option */}
                            <TouchableOpacity
                                onPress={pickImage}
                                className="flex-row items-center bg-white border border-emerald-200 py-4 px-4 rounded-xl"
                                activeOpacity={0.7}
                            >
                                <View className="w-10 h-10 bg-emerald-500 rounded-xl items-center justify-center">
                                    <Ionicons name="images" size={20} color="#ffffff" />
                                </View>
                                <View className="flex-1" style={{ marginLeft: 12 }}>
                                    <Text className="text-base font-semibold text-gray-800">Choose from Gallery</Text>
                                    <Text className="text-gray-500 text-sm mt-0.5">Select from photos</Text>
                                </View>
                                <View className="w-6 h-6 items-center justify-center">
                                    <Ionicons name="chevron-forward" size={16} color="#10b981" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Size Limit Info */}
                        <View className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <View className="flex-row items-center" style={{ gap: 8 }}>
                                <View className="w-5 h-5 bg-emerald-500 rounded items-center justify-center">
                                    <Ionicons name="information" size={12} color="#ffffff" />
                                </View>
                                <Text className="text-emerald-800 font-medium text-sm">Size Limit: Under 200 KB</Text>
                            </View>
                        </View>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            onPress={() => {
                                setShowModal(false);
                                router.back();
                            }
                            }
                            className="mt-6 py-4 items-center bg-gray-100 rounded-xl"
                            activeOpacity={0.7}
                        >
                            <Text className="text-gray-600 font-medium">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>
        </ScrollView>
    );
}