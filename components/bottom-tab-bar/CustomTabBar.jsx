// CustomTabBar.js
import { TAB_CONFIG } from '@/constants/tabConfig';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActiveIndicator from './ActiveIndicator';

function CustomTabBar() {
    const { colorScheme } = useColorScheme();
    const router = useRouter();
    const pathname = usePathname();
    const segments = useSegments();
    const insets = useSafeAreaInsets();

    const activeIndex = useMemo(() => {
        if (pathname === '/' || pathname === '' || segments.length === 0) {
            return 0;
        }
        const currentTab = segments[segments.length - 1];
        const tabIndex = TAB_CONFIG.findIndex(tab => {
            if (tab.name === 'index') {
                return currentTab === '(tabs)' || currentTab === 'index' || !currentTab;
            }
            return tab.name === currentTab;
        });
        return Math.max(0, tabIndex);
    }, [pathname, segments]);

    const handleTabPress = (tab) => {
        router.push(tab.path);
    };

    // Dynamic colors based on theme
    const backgroundColor = colorScheme === 'dark' ? '#1f2937' : '#ffffff'; // gray-800 / white
    const borderColor = colorScheme === 'dark' ? '#374151' : '#e5e7eb'; // gray-700 / gray-200
    const textActiveColor = colorScheme === 'dark' ? '#ffffff' : '#059669'; // white / gray-900
    const textInactiveColor = colorScheme === 'dark' ? '#9ca3af' : '#6b7280'; // gray-400 / gray-500

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor,
                borderTopWidth: 1,
                borderTopColor: borderColor,
                flexDirection: 'row',
                paddingTop: 8,
                paddingBottom: insets.bottom,
                height: 70 + insets.bottom,
                zIndex: 1000,
            }}
        >
            {TAB_CONFIG.map((tab, index) => {
                const isActive = activeIndex === index;
                const color = isActive 
                    ? (colorScheme === 'dark' ? '#ecfdf5' : '#10b981') // emerald-400 / emerald-500
                    : (colorScheme === 'dark' ? '#9ca3af' : '#94a3b8'); // gray-400 / slate-400
                const textColor = isActive ? textActiveColor : textInactiveColor;

                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => handleTabPress(tab)}
                        activeOpacity={0.7}
                    >
                        <ActiveIndicator isActive={isActive} />

                        <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 40 }}>
                            {tab.icon(color, 25)}
                            <Text
                                style={{
                                    fontSize: isActive ? 11 : 10,
                                    fontWeight: isActive ? '700' : '500',
                                    color: textColor,
                                    marginTop: isActive ? 6 : 4,
                                    textAlign: 'center',
                                }}
                            >
                                {tab.label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default CustomTabBar;