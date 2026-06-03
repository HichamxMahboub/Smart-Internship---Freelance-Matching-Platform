import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Offer } from '../types';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { StatusBadge } from './StatusBadge';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { MatchBadge } from './MatchBadge';

export function OfferCard({ offer, onPress, matchScore }: { offer: Offer; onPress?: () => void; matchScore?: number }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Avatar name={offer.title} size={46} />
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>{offer.title}</Text>
          <View style={styles.metaRow}>
            <Icon name="location" size={13} color={colors.muted} />
            <Text style={styles.meta} numberOfLines={1}>{offer.location || 'Remote'} · {offer.duration || 'Flexible'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {typeof matchScore === 'number' ? <MatchBadge score={matchScore} size="sm" /> : null}
          <StatusBadge status={offer.type} />
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>{offer.description}</Text>
      <View style={styles.footer}>
        <View style={styles.skills}>
          {offer.requiredSkills?.slice(0, 3).map((skill) => <Chip key={skill} label={skill} tone="brand" />)}
          {offer.requiredSkills?.length > 3 ? <Chip label={`+${offer.requiredSkills.length - 3}`} tone="neutral" /> : null}
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>View</Text>
          <Icon name="chevron-right" size={13} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 13, ...shadow.soft },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.96 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  headerText: { flex: 1, gap: 4 },
  title: { color: colors.text, fontSize: 16.5, fontWeight: '800', letterSpacing: -0.3, lineHeight: 21 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { color: colors.muted, fontWeight: '600', fontSize: 12.5, flexShrink: 1 },
  description: { color: colors.textSoft, lineHeight: 20, fontSize: 13.5 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  skills: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ctaText: { color: colors.primary, fontWeight: '800', fontSize: 13.5 }
});
