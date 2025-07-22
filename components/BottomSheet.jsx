import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export default function BottomSheet({ visible, onClose, height = screenHeight * 0.4 }) {
    const translateY = useRef(new Animated.Value(screenHeight)).current;
    const dragThreshold = height * 0.4; // 40% of sheet height to trigger close

    useEffect(() => {
        if (visible) {
            Animated.timing(translateY, {
                toValue: screenHeight - height,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: screenHeight,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,

            onPanResponderMove: (_, gestureState) => {
                const newPosition = screenHeight - height + gestureState.dy;
                if (gestureState.dy > 0) {
                    translateY.setValue(newPosition);
                }
            },

            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > dragThreshold) {
                    // Animate sheet down, then call onClose
                    Animated.timing(translateY, {
                        toValue: screenHeight,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        requestAnimationFrame(() => onClose());
                    });
                } else {
                    // Snap back up smoothly
                    Animated.spring(translateY, {
                        toValue: screenHeight - height,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 10,
                    }).start();
                }
            }

        })
    ).current;

    if (!visible) return null;

    return (
        <>
            <Pressable
                onPress={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                }}
            />

            <Animated.View
                {...panResponder.panHandlers}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: screenHeight,
                    transform: [{ translateY }],
                }}
            >
                <View
                    style={{
                        height,
                        backgroundColor: 'white',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -3 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5,
                        flex: 1,
                        justifyContent: 'space-between',
                    }}
                >
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        <View
                            style={{
                                width: 40,
                                height: 5,
                                borderRadius: 3,
                                backgroundColor: '#ccc',
                                marginBottom: 10,
                            }}
                        />
                        <Text className="text-lg font-semibold">Custom Bottom Sheet</Text>
                    </View>

                    <TouchableOpacity
                        className="bg-red-500 py-3 rounded-lg"
                        onPress={onClose}
                    >
                        <Text className="text-white text-center font-bold">Close</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </>
    );
}
