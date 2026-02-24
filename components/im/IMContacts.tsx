/**
 * IMContacts - 微信风格的通讯录
 * 
 * 功能：
 * - 核心智囊团（6个固定 Agent）
 * - 可选配的合作 Agent
 * - 按字母索引快速定位
 * - 点击头像进入私聊
 */
import React, { useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SectionList,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Agent } from '../../types';
import { AgentAvatar } from '../AgentAvatar';
import { BASE_URL } from '../../services/api';
import { TEXT, BACKGROUND, BORDER, PRIMARY, SUCCESS } from '../../styles/colors';

// ==================== 类型定义 ====================

interface IMContactsProps {
  agents: Agent[];
  onAgentPress: (agent: Agent) => void;
  onGroupPress?: () => void;
  profile?: { avatarId?: string | null; nickname?: string | null };
}

interface ContactSection {
  title: string;
  data: Agent[];
}

// ==================== 常量 ====================

const CORE_AGENT_IDS = ['general', 'legal', 'mechanic', 'health', 'algo', 'metaphysics'];

// 核心 Agent 角色描述
const CORE_AGENT_ROLES: Record<string, { role: string; color: string }> = {
  general: { role: '总参谋', color: '#FF6B6B' },
  legal: { role: '法律顾问', color: '#4ECDC4' },
  mechanic: { role: '技术专家', color: '#45B7D1' },
  health: { role: '健康顾问', color: '#96CEB4' },
  algo: { role: '数据分析', color: '#FFEAA7' },
  metaphysics: { role: '运势指导', color: '#DDA0DD' },
};

// 获取拼音首字母（简化版本）
const getPinyinInitial = (name: string): string => {
  const firstChar = name.charAt(0);
  // 这里可以接入拼音库，暂时使用 Unicode 范围判断
  const code = firstChar.charCodeAt(0);
  if (code >= 0x4E00 && code <= 0x9FFF) {
    // 简化的拼音首字母映射（按照常见字频）
    const pinyinMap: Record<string, string[]> = {
      'A': ['阿', '艾', '安', '敖'],
      'B': ['白', '包', '卜', '步', '毕'],
      'C': ['蔡', '曹', '陈', '程', '崔'],
      'D': ['戴', '邓', '丁', '董', '杜'],
      'F': ['范', '方', '费', '冯', '傅'],
      'G': ['高', '葛', '龚', '顾', '郭'],
      'H': ['韩', '何', '贺', '洪', '胡', '黄'],
      'J': ['贾', '简', '江', '蒋', '金'],
      'K': ['康', '柯', '孔', '阿K'],
      'L': ['赖', '蓝', '雷', '黎', '李', '梁', '廖', '林', '刘', '龙', '卢', '陆', '吕', '罗'],
      'M': ['马', '毛', '孟', '莫', '穆'],
      'N': ['倪', '聂', '牛', '宁'],
      'O': ['欧'],
      'P': ['潘', '庞', '裴', '彭', '蒲'],
      'Q': ['齐', '钱', '秦', '邱', '裘'],
      'R': ['任', '阮'],
      'S': ['沙', '邵', '沈', '施', '石', '史', '宋', '苏', '孙'],
      'T': ['谭', '汤', '唐', '陶', '田', '童'],
      'W': ['万', '汪', '王', '韦', '魏', '温', '翁', '吴', '伍'],
      'X': ['夏', '项', '肖', '谢', '熊', '徐', '许', '薛', '翔'],
      'Y': ['严', '颜', '杨', '姚', '叶', '易', '殷', '尤', '于', '余', '袁', '岳', '云'],
      'Z': ['曾', '詹', '张', '章', '赵', '郑', '钟', '周', '朱', '祝', '庄', '邹'],
    };
    
    for (const [letter, chars] of Object.entries(pinyinMap)) {
      if (chars.some(c => name.includes(c))) {
        return letter;
      }
    }
    return '#';
  } else if (code >= 65 && code <= 90) {
    return firstChar;
  } else if (code >= 97 && code <= 122) {
    return firstChar.toUpperCase();
  }
  return '#';
};

// ==================== 子组件 ====================

interface ContactItemProps {
  agent: Agent;
  onPress: () => void;
  isCore?: boolean;
}

const ContactItem: React.FC<ContactItemProps> = ({ agent, onPress, isCore }) => {
  const roleInfo = CORE_AGENT_ROLES[agent.id];

  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress} activeOpacity={0.7}>
      <AgentAvatar
        avatar={agent.avatar}
        size={44}
        isPaid={agent.isPaid}
        baseUrl={BASE_URL}
      />
      <View style={styles.contactInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.contactName}>{agent.name}</Text>
          {isCore && roleInfo && (
            <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '33' }]}>
              <Text style={[styles.roleBadgeText, { color: roleInfo.color }]}>
                {roleInfo.role}
              </Text>
            </View>
          )}
          {agent.isPaid && (
            <View style={styles.enterpriseBadge}>
              <Text style={styles.enterpriseBadgeText}>企业认证</Text>
            </View>
          )}
        </View>
        <Text style={styles.contactTitle} numberOfLines={1}>
          {agent.title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={TEXT.quaternary} />
    </TouchableOpacity>
  );
};

// 核心智囊团卡片
interface CoreTeamCardProps {
  agents: Agent[];
  onAgentPress: (agent: Agent) => void;
}

const CoreTeamCard: React.FC<CoreTeamCardProps> = ({ agents, onAgentPress }) => {
  return (
    <View style={styles.coreTeamCard}>
      <View style={styles.coreTeamHeader}>
        <Text style={styles.coreTeamTitle}>核心智囊团</Text>
        <Text style={styles.coreTeamSubtitle}>您的专属顾问团队</Text>
      </View>
      <View style={styles.coreTeamGrid}>
        {agents.map((agent) => {
          const roleInfo = CORE_AGENT_ROLES[agent.id] || { role: '顾问', color: '#888' };
          return (
            <TouchableOpacity
              key={agent.id}
              style={styles.coreTeamItem}
              onPress={() => onAgentPress(agent)}
              activeOpacity={0.7}
            >
              <View style={[styles.coreAvatarRing, { borderColor: roleInfo.color }]}>
                <AgentAvatar
                  avatar={agent.avatar}
                  size={48}
                  baseUrl={BASE_URL}
                />
              </View>
              <Text style={styles.coreAgentName}>{agent.name}</Text>
              <Text style={[styles.coreAgentRole, { color: roleInfo.color }]}>
                {roleInfo.role}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ==================== 主组件 ====================

export const IMContacts: React.FC<IMContactsProps> = ({
  agents,
  onAgentPress,
  onGroupPress,
  profile,
}) => {
  const insets = useSafeAreaInsets();
  const sectionListRef = useRef<SectionList>(null);

  // 分离核心 Agent 和合作 Agent
  const { coreAgents, partnerSections } = useMemo(() => {
    const core: Agent[] = [];
    const partners: Agent[] = [];

    agents.forEach(agent => {
      if (agent.category === 'system') return;
      if (CORE_AGENT_IDS.includes(agent.id)) {
        core.push(agent);
      } else {
        partners.push(agent);
      }
    });

    // 核心 Agent 按预设顺序排列
    const sortedCore = core.sort((a, b) => 
      CORE_AGENT_IDS.indexOf(a.id) - CORE_AGENT_IDS.indexOf(b.id)
    );

    // 合作 Agent 按拼音首字母分组
    const grouped: Record<string, Agent[]> = {};
    partners.forEach(agent => {
      const initial = getPinyinInitial(agent.name);
      if (!grouped[initial]) grouped[initial] = [];
      grouped[initial].push(agent);
    });

    // 转换为 SectionList 格式
    const sections: ContactSection[] = Object.keys(grouped)
      .sort((a, b) => {
        if (a === '#') return 1;
        if (b === '#') return -1;
        return a.localeCompare(b);
      })
      .map(key => ({
        title: key,
        data: grouped[key].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
      }));

    return { coreAgents: sortedCore, partnerSections: sections };
  }, [agents]);

  // 索引字母列表
  const indexLetters = useMemo(() => {
    const letters = partnerSections.map(s => s.title);
    return ['★', ...letters]; // ★ 代表核心智囊团
  }, [partnerSections]);

  // 点击索引快速定位
  const handleIndexPress = (letter: string) => {
    if (letter === '★') {
      sectionListRef.current?.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        animated: true,
      });
    } else {
      const sectionIndex = partnerSections.findIndex(s => s.title === letter);
      if (sectionIndex >= 0) {
        sectionListRef.current?.scrollToLocation({
          sectionIndex: sectionIndex + 1, // +1 因为有 header
          itemIndex: 0,
          animated: true,
        });
      }
    }
  };

  const renderSectionHeader = ({ section }: { section: ContactSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Agent }) => (
    <ContactItem
      agent={item}
      onPress={() => onAgentPress(item)}
      isCore={CORE_AGENT_IDS.includes(item.id)}
    />
  );

  const ListHeader = () => (
    <View>
      {/* 群聊入口 */}
      <TouchableOpacity style={styles.groupEntry} onPress={onGroupPress} activeOpacity={0.7}>
        <View style={styles.groupIcon}>
          <Ionicons name="people" size={24} color="#fff" />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>核心议事厅</Text>
          <Text style={styles.groupDesc}>6位核心顾问随时待命</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={TEXT.tertiary} />
      </TouchableOpacity>

      {/* 核心智囊团 */}
      <CoreTeamCard agents={coreAgents} onAgentPress={onAgentPress} />

      {/* 合作顾问分隔 */}
      {partnerSections.length > 0 && (
        <View style={styles.partnerHeader}>
          <Text style={styles.partnerTitle}>合作顾问</Text>
          <Text style={styles.partnerCount}>{partnerSections.reduce((sum, s) => sum + s.data.length, 0)}位</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        ref={sectionListRef as any}
        sections={partnerSections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 右侧索引条 */}
      <View style={[styles.indexBar, { top: insets.top + 100 }]}>
        {indexLetters.map((letter) => (
          <TouchableOpacity
            key={letter}
            onPress={() => handleIndexPress(letter)}
            style={styles.indexItem}
          >
            <Text style={styles.indexText}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },

  // 群聊入口
  groupEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER.light,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT.primary,
  },
  groupDesc: {
    fontSize: 13,
    color: TEXT.tertiary,
    marginTop: 2,
  },

  // 核心智囊团卡片
  coreTeamCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  coreTeamHeader: {
    marginBottom: 16,
  },
  coreTeamTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT.primary,
  },
  coreTeamSubtitle: {
    fontSize: 13,
    color: TEXT.tertiary,
    marginTop: 4,
  },
  coreTeamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  coreTeamItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  coreAvatarRing: {
    padding: 3,
    borderRadius: 28,
    borderWidth: 2,
  },
  coreAgentName: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.primary,
    marginTop: 8,
  },
  coreAgentRole: {
    fontSize: 11,
    marginTop: 2,
  },

  // 合作顾问
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BACKGROUND.secondary,
  },
  partnerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.secondary,
  },
  partnerCount: {
    fontSize: 13,
    color: TEXT.tertiary,
  },

  // Section
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: BACKGROUND.secondary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.tertiary,
  },

  // 联系人项
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: BACKGROUND.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER.light,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT.primary,
  },
  roleBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  enterpriseBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FFF3CD',
  },
  enterpriseBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#856404',
  },
  contactTitle: {
    fontSize: 13,
    color: TEXT.tertiary,
    marginTop: 2,
  },

  // 索引条
  indexBar: {
    position: 'absolute',
    right: 4,
    alignItems: 'center',
    paddingVertical: 4,
  },
  indexItem: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  indexText: {
    fontSize: 11,
    fontWeight: '600',
    color: PRIMARY,
  },
});

export default IMContacts;
