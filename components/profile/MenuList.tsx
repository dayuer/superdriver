/**
 * 菜单列表组件
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, BACKGROUND, BORDER, PRIMARY, DANGER } from '../../styles/colors';

export interface MenuItem {
    id: string;
    icon: string;
    label: string;
    value?: string;
    showArrow?: boolean;
    showSwitch?: boolean;
    switchValue?: boolean;
    danger?: boolean;
}

export interface MenuListProps {
    title?: string;
    items: MenuItem[];
    onPress?: (id: string) => void;
    onSwitchChange?: (id: string, value: boolean) => void;
}

export const MenuList: React.FC<MenuListProps> = ({
    title,
    items,
    onPress,
    onSwitchChange,
}) => {
    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={styles.list}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.item,
                            index === items.length - 1 && styles.itemLast,
                        ]}
                        onPress={() => !item.showSwitch && onPress?.(item.id)}
                        disabled={item.showSwitch}
                    >
                        <Ionicons
                            name={item.icon as any}
                            size={20}
                            color={item.danger ? DANGER : TEXT.primary}
                        />
                        <Text style={[styles.label, item.danger && styles.labelDanger]}>
                            {item.label}
                        </Text>

                        {item.value && <Text style={styles.value}>{item.value}</Text>}

                        {item.showSwitch ? (
                            <Switch
                                value={item.switchValue}
                                onValueChange={(val) => onSwitchChange?.(item.id, val)}
                                trackColor={{ false: '#E5E5EA', true: PRIMARY }}
                                thumbColor="#fff"
                            />
                        ) : item.showArrow !== false ? (
                            <Ionicons name="chevron-forward" size={18} color={TEXT.tertiary} />
                        ) : null}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: TEXT.secondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    list: {
        backgroundColor: BACKGROUND.card,
        borderRadius: 16,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: BORDER.light,
    },
    itemLast: {
        borderBottomWidth: 0,
    },
    label: {
        flex: 1,
        fontSize: 15,
        color: TEXT.primary,
    },
    labelDanger: {
        color: DANGER,
    },
    value: {
        fontSize: 14,
        color: TEXT.secondary,
        marginRight: 4,
    },
});

export default MenuList;
