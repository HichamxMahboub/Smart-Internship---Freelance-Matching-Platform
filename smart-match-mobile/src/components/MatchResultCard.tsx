import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { MatchBadge } from './MatchBadge';
import { Icon } from './Icon';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';

interface Props {
  title: string;
  subtitle?: string;
  score?: number;
  reasons?: string[];
  gaps?: string[];
  onPress?: () => void;
  /** 1-based rank; rank 1 gets a gold badge. */
  rank?: number;
  /** When set, shows an avatar generated from this name. */
  avatarName?: string;
  /** Highlights the card as the top match. */
  highlight?: boolean;
}

/** AI match result card: rank + avatar + score badge, with "why it fits" reasons and gaps. */
export function MatchResultCard({ title, subtitle, score, reasons, gaps, onPress, rank, avatarName, highlight }: Props) {
  const body = (
    <>
      {highlight ? (
        <View style={styles.topPill}>
          <Icon name="star" size={11} color={colors.white} />
          <Text style={styles.topPillText}>TOP MATCH</Text>
        </View>
      ) : null}
      <View style={styles.head}>
        {rank ? (
          <View style={[styles.rank, rank === 1 && styles.rankTop]}>
            <Text style={[styles.rankText, rank === 1 && styles.rankTextTop]}>{rank}</Text>
          </View>
        ) : null}
        {avatarName ? <Avatar name={avatarName} size={42} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {subtitle ? <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {typeof score === 'number' ? <MatchBadge score={score} size="md" /> : null}
      </View>
      {reasons && reasons.length > 0 ? (
        <View style={styles.list}>
          {reasons.slice(0, 3).map((r, i) => (
            <View key={`r${i}`} style={styles.row}>
              <Text style={styles.tick}>✓</Text>
              <Text style={styles.reason}>{r}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {gaps && gaps.length > 0 ? (
        <View style={styles.list}>
          {gaps.slice(0, 2).map((g, i) => (
            <View key={`g${i}`} style={styles.row}>
              <Text style={styles.dash}>–</Text>
              <Text style={styles.gap}>{g}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {onPress ? (
        <View style={styles.cta}>
          <Text style={styles.ctaText}>View</Text>
          <Icon name="chevron-right" size={14} color={colors.primary} />
        </View>
      ) : null}
    </>
  );

  const cardStyle = [styles.card, highlight && styles.cardTop];
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}>
        {body}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{body}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 15, gap: 11, ...shadow.xs },
  cardTop: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.primaryLight },
  pressed: { opacity: 0.96, transform: [{ scale: 0.99 }] },
  topPill: { position: 'absolute', top: -1, right: 14, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primary, paddingHorizontal: 9, paddingVertical: 3, borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm },
  topPillText: { color: colors.white, fontWeight: '900', fontSize: 9.5, letterSpacing: 0.6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  rank: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.backgroundAlt, alignItems: 'center', justifyContent: 'center' },
  rankTop: { backgroundColor: colors.gold },
  rankText: { color: colors.muted, fontWeight: '900', fontSize: 13 },
  rankTextTop: { color: colors.white },
  title: { color: colors.text, fontWeight: '800', fontSize: 15.5, letterSpacing: -0.2, lineHeight: 20 },
  sub: { color: colors.muted, fontSize: 12.5, fontWeight: '600', marginTop: 2 },
  list: { gap: 5 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  tick: { color: colors.success, fontWeight: '900', fontSize: 13, lineHeight: 19 },
  dash: { color: colors.muted, fontWeight: '900', fontSize: 13, lineHeight: 19 },
  reason: { flex: 1, color: colors.textSoft, fontSize: 13, lineHeight: 19 },
  gap: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 19 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  ctaText: { color: colors.primary, fontWeight: '800', fontSize: 13 }
});
