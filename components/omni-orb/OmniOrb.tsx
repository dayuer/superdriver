/**
 * OmniOrb — 全能交互球 (悬浮球)
 *
 * 设计原则:
 *   1. 最小干扰 — 常态下仅 56px 小球，不遮挡业务页面
 *   2. 即时可达 — 长按激活语音，点击展开对话面板
 *   3. 三态循环 — idle → listening → responding → idle
 *
 * 架构:
 *   - 不内含 Agent 通信逻辑，纯 UI 组件
 *   - 通过 props 回调与外部通信层交互
 *   - 可定制主题（颜色/大小）以适配不同宿主 App
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
  ScrollView,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { AgentStreamEvent } from '../../services/openclaw-client';

// ============================================================================
// 类型定义
// ============================================================================

export type OrbState = 'idle' | 'listening' | 'responding';

export interface OmniOrbTheme {
  /** 主色调渐变起始色 */
  primaryStart: string;
  /** 主色调渐变结束色 */
  primaryEnd: string;
  /** 悬浮球大小 */
  size: number;
  /** 脉冲动画颜色 */
  pulseColor: string;
}

export interface OmniOrbProps {
  /** 当前状态 */
  state: OrbState;
  /** 长按开始录音 */
  onLongPress: () => void;
  /** 松手停止录音 */
  onRelease: () => void;
  /** 点击展开/收起面板 */
  onTap: () => void;
  /** 中断当前 Agent 回复 */
  onAbort?: () => void;
  /** 当前回复文本（流式累积） */
  responseText?: string;
  /** 当前回应的 Agent 名称 */
  agentName?: string;
  /** 是否展开对话面板 */
  expanded?: boolean;
  /** 主题定制 */
  theme?: Partial<OmniOrbTheme>;
}

// ============================================================================
// 默认主题
// ============================================================================

const DEFAULT_THEME: OmniOrbTheme = {
  primaryStart: '#667eea',
  primaryEnd: '#764ba2',
  size: 56,
  pulseColor: 'rgba(102, 126, 234, 0.3)',
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SAFE_MARGIN = 8;

// ============================================================================
// 悬浮球组件
// ============================================================================

export function OmniOrb({
  state,
  onLongPress,
  onRelease,
  onTap,
  onAbort,
  responseText,
  agentName,
  expanded = false,
  theme: themeOverride,
}: OmniOrbProps) {
  const theme = { ...DEFAULT_THEME, ...themeOverride };
  const { size } = theme;

  // ── 拖拽定位 ──
  const pan = useRef(new Animated.ValueXY({
    x: SCREEN_W - size - SAFE_MARGIN,
    y: SCREEN_H * 0.65,
  })).current;

  const lastOffset = useRef({ x: SCREEN_W - size - SAFE_MARGIN, y: SCREEN_H * 0.65 });

  // ── 动画 ──
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // ── 长按检测 ──
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  // 状态变化时的动画
  useEffect(() => {
    if (state === 'listening') {
      // 脉冲动画
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start();
      Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true }).start();
    } else if (state === 'responding') {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      // 呼吸光晕
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        ]),
      ).start();
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [state]);

  // ── 拖拽 PanResponder ──
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,

      onPanResponderGrant: () => {
        isLongPress.current = false;
        // 启动长按计时
        longPressTimer.current = setTimeout(() => {
          isLongPress.current = true;
          onLongPress();
        }, 400);
      },

      onPanResponderMove: (_, gs) => {
        // 拖动时取消长按
        if (Math.abs(gs.dx) > 10 || Math.abs(gs.dy) > 10) {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }

        const newX = Math.max(SAFE_MARGIN, Math.min(SCREEN_W - size - SAFE_MARGIN, lastOffset.current.x + gs.dx));
        const newY = Math.max(SAFE_MARGIN, Math.min(SCREEN_H - size - SAFE_MARGIN, lastOffset.current.y + gs.dy));
        pan.setValue({ x: newX, y: newY });
      },

      onPanResponderRelease: (_, gs) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        // 吸附到左右边缘
        const midX = SCREEN_W / 2;
        const currentX = lastOffset.current.x + gs.dx;
        const targetX = currentX < midX ? SAFE_MARGIN : SCREEN_W - size - SAFE_MARGIN;
        const targetY = Math.max(SAFE_MARGIN, Math.min(SCREEN_H - size - SAFE_MARGIN, lastOffset.current.y + gs.dy));

        lastOffset.current = { x: targetX, y: targetY };

        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 7,
        }).start();

        if (isLongPress.current) {
          onRelease();
          isLongPress.current = false;
        } else if (Math.abs(gs.dx) < 10 && Math.abs(gs.dy) < 10) {
          // 短按 = 点击
          onTap();
        }
      },
    }),
  ).current;

  // ── 图标 ──
  const getIcon = (): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (state) {
      case 'listening': return { name: 'mic', color: '#FF3B30' };
      case 'responding': return { name: 'chatbubble-ellipses', color: '#FFFFFF' };
      default: return { name: 'sparkles', color: '#FFFFFF' };
    }
  };

  const icon = getIcon();

  return (
    <>
      {/* 悬浮球 */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [
              { translateX: pan.x as unknown as number },
              { translateY: pan.y as unknown as number },
              { scale: scaleAnim },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* 脉冲光环 */}
        {state === 'listening' && (
          <Animated.View
            style={[
              styles.pulse,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: theme.pulseColor,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}

        {/* 渐变球体 */}
        <LinearGradient
          colors={
            state === 'listening'
              ? ['#FF3B30', '#FF6B35']
              : [theme.primaryStart, theme.primaryEnd]
          }
          style={[styles.orbBody, { width: size, height: size, borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon.name} size={size * 0.43} color={icon.color} />
        </LinearGradient>

        {/* 状态指示点 */}
        {state === 'responding' && (
          <Animated.View
            style={[
              styles.statusDot,
              { opacity: glowAnim },
            ]}
          />
        )}
      </Animated.View>

      {/* 展开的对话面板 */}
      {expanded && (
        <Modal transparent animationType="slide" visible={expanded}>
          <View style={styles.panelOverlay}>
            <View style={styles.panel}>
              {/* 面板头部 */}
              <View style={styles.panelHeader}>
                <View style={styles.panelHandle} />
                <Text style={styles.panelAgent}>
                  {agentName ? `${agentName} 回复中...` : 'Agent 思考中...'}
                </Text>
                <TouchableOpacity style={styles.panelClose} onPress={onTap}>
                  <Ionicons name="chevron-down" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              {/* 回复内容 */}
              <ScrollView style={styles.panelContent} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.panelText}>
                  {responseText || '等待回复...'}
                </Text>
              </ScrollView>

              {/* 底部操作 */}
              {state === 'responding' && onAbort && (
                <TouchableOpacity style={styles.abortBtn} onPress={onAbort}>
                  <Ionicons name="stop-circle" size={20} color="#FF3B30" />
                  <Text style={styles.abortText}>停止</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// 样式
// ============================================================================

const styles = StyleSheet.create({
  orbContainer: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pulse: {
    position: 'absolute',
  },
  orbBody: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statusDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  // 展开面板
  panelOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
    maxHeight: SCREEN_H * 0.6,
    paddingHorizontal: 20,
    paddingBottom: 34,  // SafeArea 底部
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  panelHandle: {
    position: 'absolute',
    top: 8,
    left: '50%' as unknown as number,
    marginLeft: -20,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  panelAgent: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  panelClose: {
    padding: 4,
  },
  panelContent: {
    flex: 1,
    paddingTop: 8,
  },
  panelText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1C1C1E',
  },
  abortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
    marginTop: 8,
  },
  abortText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
});

export default OmniOrb;
