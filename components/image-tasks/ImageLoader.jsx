import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Animated, Text, View } from 'react-native';

const CustomLoader = ({ 
  fadeAnim, 
  scaleAnim, 
  progressAnim, 
  processingStep, 
  progress 
}) => {
  return (
    <View className="flex-1 bg-emerald-50 justify-center items-center px-6">
      <Animated.View
        className="bg-white rounded-3xl p-8 items-center w-full max-w-sm"
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim
        }}
      >
        {/* Animated Processing Icon */}
        <View className="relative mb-6">
          <View className="w-20 h-20 bg-emerald-600 rounded-full items-center justify-center">
            <Ionicons name="scan-outline" size={48} color="white" />
            
            {/* Overlay ActivityIndicator at the center */}
            <View className="absolute inset-0 items-center justify-center">
              <ActivityIndicator size="small" color="white" />
            </View>
          </View>
        </View>

        <Text className="text-xl font-bold text-gray-800 mb-2">Processing Image</Text>
        <Text className="text-gray-600 text-center mb-6 leading-5">{processingStep}</Text>

        {/* Enhanced Progress Bar */}
        <View className="w-full">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700">Progress</Text>
            <Text className="text-sm font-bold text-emerald-600">{progress}%</Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <Animated.View
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }}
            />
          </View>
        </View>

        {/* Processing Steps Indicator */}
        <View className="mt-6 w-full" style={{ gap: 12 }}>
          {['Analyze', 'Process', 'Extract', 'Format'].map((step, index) => (
            <View key={step} className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-3 ${
                progress > (index + 1) * 25 
                  ? 'bg-emerald-500' 
                  : progress > index * 25 
                    ? 'bg-emerald-400' 
                    : 'bg-slate-400'
              }`} />
              <Text className={`text-sm ${
                progress > index * 25 
                  ? 'text-gray-800' 
                  : 'text-slate-400'
              }`}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default CustomLoader;