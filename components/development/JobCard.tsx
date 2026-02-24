/**
 * 招聘卡片组件 (Boss直聘风格)
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobPosition } from '../../services/development';
import { Tag } from '../ui/Tag';
import { Logo } from '../ui/Logo';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS, DANGER } from '../../styles/colors';

export interface JobCardProps {
    job: JobPosition;
    onPress?: (job: JobPosition) => void;
    onChat?: (job: JobPosition) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
    job,
    onPress,
    onChat,
}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={() => onPress?.(job)}
        >
            <View style={styles.header}>
                <View style={styles.info}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
                        {job.isNew && <Tag text="NEW" variant="new" />}
                        {job.isHot && (
                            <View style={styles.hotBadge}>
                                <Ionicons name="flame" size={10} color="#fff" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.salary}>{job.salary}</Text>
                </View>
                <Logo
                    text={job.logoText}
                    backgroundColor={job.logoColor}
                    size="md"
                />
            </View>

            <View style={styles.meta}>
                <Text style={styles.company}>{job.company}</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.city}>{job.city}</Text>
            </View>

            <View style={styles.tags}>
                {job.tags.slice(0, 4).map((tag, i) => (
                    <Tag key={i} text={tag} variant="default" />
                ))}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={(e) => {
                        e.stopPropagation?.();
                        onChat?.(job);
                    }}
                >
                    <Ionicons name="chatbubble-outline" size={16} color={PRIMARY} />
                    <Text style={styles.actionText}>立即沟通</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND.card,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    info: {
        flex: 1,
        marginRight: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: TEXT.primary,
        flexShrink: 1,
    },
    hotBadge: {
        backgroundColor: DANGER,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    salary: {
        fontSize: 18,
        fontWeight: '700',
        color: DANGER,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    company: {
        fontSize: 13,
        color: TEXT.primary,
        fontWeight: '500',
    },
    dot: {
        fontSize: 13,
        color: TEXT.tertiary,
        marginHorizontal: 6,
    },
    city: {
        fontSize: 13,
        color: TEXT.secondary,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    actions: {
        borderTopWidth: 1,
        borderTopColor: BORDER.light,
        paddingTop: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        backgroundColor: `${PRIMARY}10`,
        borderRadius: 20,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: PRIMARY,
    },
});

export default JobCard;
