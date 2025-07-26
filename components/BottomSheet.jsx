import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export default function BottomSheet({
    visible,
    onClose,
    heightRatio = 0.5,
    children,
    title = "Custom Bottom Sheet"
}) {
    const BOTTOM_SHEET_HEIGHT = screenHeight * heightRatio;
    const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
    const dragThreshold = BOTTOM_SHEET_HEIGHT * 0.4;

    useEffect(() => {
        if (visible) {
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: BOTTOM_SHEET_HEIGHT,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, BOTTOM_SHEET_HEIGHT]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },

            onPanResponderMove: (_, gestureState) => {
                // Allow dragging both up and down, but limit upward movement
                const newTranslateY = Math.max(0, gestureState.dy);
                translateY.setValue(newTranslateY);
            },

            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > dragThreshold) {
                    // Close the bottom sheet with smooth animation
                    Animated.timing(translateY, {
                        toValue: BOTTOM_SHEET_HEIGHT,
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => {
                        onClose();
                    });
                } else {
                    // Snap back to open position with spring animation
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 120,
                        friction: 8,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            {visible &&
                <StatusBar backgroundColor="#00000080" barStyle="dark-content" />
            }
            <View style={styles.modalContainer}>
                {/* Backdrop */}
                <Pressable
                    style={styles.backdrop}
                    onPress={onClose}
                />

                {/* Bottom Sheet */}
                <Animated.View
                    style={[
                        styles.bottomSheetContainer,
                        {
                            height: BOTTOM_SHEET_HEIGHT,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    {/* Draggable Header Area */}
                    <View
                        style={styles.draggableArea}
                        {...panResponder.panHandlers}
                    >
                        {/* Drag Handle */}
                        <View style={styles.dragHandleContainer}>
                            <View style={styles.dragHandle} />
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                        </View>
                    </View>

                    {/* Non-draggable Content Area */}
                    <View style={styles.contentContainer}>
                        {children}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bottomSheetContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    draggableArea: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    dragHandle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#ccc',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
});