/**
 * 城市选择器 Modal 组件
 */
import React, { useState, useRef, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HOT_CITIES, CITY_DATA, CITY_LETTERS } from '../../config/mock-data';
import { TEXT, BACKGROUND, BORDER, PRIMARY } from '../../styles/colors';

export interface CityPickerModalProps {
    visible: boolean;
    activeCity: string;
    onClose: () => void;
    onSelect: (city: string) => void;
}

export const CityPickerModal: React.FC<CityPickerModalProps> = ({
    visible,
    activeCity,
    onClose,
    onSelect,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const cityListRef = useRef<ScrollView>(null);
    const letterPositions = useRef<{ [key: string]: number }>({});

    // 城市搜索过滤
    const filteredCityData = useMemo(() => {
        if (!searchQuery) return CITY_DATA;
        const result: { [key: string]: string[] } = {};
        Object.entries(CITY_DATA).forEach(([letter, cities]) => {
            const filtered = cities.filter(city => city.includes(searchQuery));
            if (filtered.length > 0) {
                result[letter] = filtered;
            }
        });
        return result;
    }, [searchQuery]);

    const handleSelect = (city: string) => {
        onSelect(city);
        setSearchQuery('');
    };

    const handleClose = () => {
        setSearchQuery('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {/* 顶部导航栏 */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleClose}>
                        <Ionicons name="arrow-back" size={24} color={TEXT.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>选择城市</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* 搜索框 */}
                <View style={styles.searchWrapper}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={TEXT.secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="搜索城市"
                            placeholderTextColor={TEXT.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={TEXT.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 城市列表 */}
                <ScrollView
                    ref={cityListRef}
                    style={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 定位城市 */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="locate" size={16} color={PRIMARY} />
                            <Text style={styles.sectionTitle}>定位城市</Text>
                        </View>
                        <View style={styles.cityGrid}>
                            <TouchableOpacity
                                style={[styles.cityItem, activeCity === '全部' && styles.cityItemActive]}
                                onPress={() => handleSelect('全部')}
                            >
                                <Ionicons name="navigate" size={14} color={activeCity === '全部' ? PRIMARY : TEXT.secondary} />
                                <Text style={[styles.cityItemText, activeCity === '全部' && styles.cityItemTextActive]}>
                                    全国
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 热门城市 */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="flame" size={16} color="#FF6B00" />
                            <Text style={styles.sectionTitle}>热门城市</Text>
                        </View>
                        <View style={styles.cityGrid}>
                            {HOT_CITIES.map(city => (
                                <TouchableOpacity
                                    key={city}
                                    style={[styles.cityItem, activeCity === city && styles.cityItemActive]}
                                    onPress={() => handleSelect(city)}
                                >
                                    <Text style={[styles.cityItemText, activeCity === city && styles.cityItemTextActive]}>
                                        {city}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 按字母分组的城市列表 */}
                    {Object.entries(filteredCityData).sort().map(([letter, cities]) => (
                        <View
                            key={letter}
                            style={styles.section}
                            onLayout={(e) => {
                                letterPositions.current[letter] = e.nativeEvent.layout.y;
                            }}
                        >
                            <View style={styles.letterHeader}>
                                <Text style={styles.letterText}>{letter}</Text>
                            </View>
                            <View style={styles.cityGrid}>
                                {cities.map(city => (
                                    <TouchableOpacity
                                        key={city}
                                        style={[styles.cityItem, activeCity === city && styles.cityItemActive]}
                                        onPress={() => handleSelect(city)}
                                    >
                                        <Text style={[styles.cityItemText, activeCity === city && styles.cityItemTextActive]}>
                                            {city}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}

                    <View style={{ height: 50 }} />
                </ScrollView>

                {/* 右侧字母索引 */}
                <View style={styles.letterIndex}>
                    {CITY_LETTERS.map(letter => (
                        <TouchableOpacity
                            key={letter}
                            style={styles.letterItem}
                            onPress={() => {
                                const y = letterPositions.current[letter];
                                if (y !== undefined && cityListRef.current) {
                                    // 直接滚动到字母区块的位置，不需要额外偏移
                                    cityListRef.current.scrollTo({ y, animated: true });
                                }
                            }}
                        >
                            <Text style={styles.letterItemText}>{letter}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: BACKGROUND.card,
        borderBottomWidth: 1,
        borderBottomColor: BORDER.light,
    },
    backBtn: {
        width: 40,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: TEXT.primary,
    },
    searchWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: BACKGROUND.card,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F5',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: TEXT.primary,
        padding: 0,
    },
    listContainer: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT.primary,
    },
    letterHeader: {
        marginBottom: 12,
    },
    letterText: {
        fontSize: 16,
        fontWeight: '700',
        color: TEXT.primary,
    },
    cityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    cityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: BACKGROUND.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BORDER.light,
    },
    cityItemActive: {
        backgroundColor: `${PRIMARY}10`,
        borderColor: PRIMARY,
    },
    cityItemText: {
        fontSize: 14,
        color: TEXT.primary,
    },
    cityItemTextActive: {
        color: PRIMARY,
        fontWeight: '600',
    },
    letterIndex: {
        position: 'absolute',
        right: 2,
        top: 140,
        bottom: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 4,
    },
    letterItem: {
        paddingVertical: 2,
        paddingHorizontal: 6,
    },
    letterItemText: {
        fontSize: 11,
        fontWeight: '600',
        color: PRIMARY,
    },
});

export default CityPickerModal;
