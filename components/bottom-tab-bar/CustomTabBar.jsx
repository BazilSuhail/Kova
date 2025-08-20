import { COLORS } from '@/constants/colors';
import { TAB_CONFIG } from '@/constants/tabConfig';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActiveIndicator from './ActiveIndicator';

function CustomTabBar() {
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

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: COLORS.cardBackground,
                borderTopWidth: 1,
                borderTopColor: COLORS.tabBarBorder,
                flexDirection: 'row',
                paddingTop: 8,
                paddingBottom: insets.bottom,
                height: 70 + insets.bottom,
                zIndex: 1000,
            }}
        >
            {TAB_CONFIG.map((tab, index) => {
                const isActive = activeIndex === index;
                const color = isActive ? COLORS.primary : COLORS.iconInactive;
                const textColor = isActive ? COLORS.textActive : COLORS.textInactive;

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
