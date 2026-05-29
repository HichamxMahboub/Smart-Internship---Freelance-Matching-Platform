import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Offer } from '../types';
import { colors } from '../theme/colors';
import { StatusBadge } from './StatusBadge';

export function OfferCard({ offer, onPress }: { offer: Offer; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={styles.card}><View style={styles.header}><Text style={styles.title}>{offer.title}</Text><StatusBadge status={offer.type} /></View><Text style={styles.meta}>{offer.location || 'Remote'} · {offer.duration || 'Flexible'}</Text><Text style={styles.description} numberOfLines={2}>{offer.description}</Text><View style={styles.skills}>{offer.requiredSkills?.slice(0, 4).map((skill) => <Text key={skill} style={styles.skill}>{skill}</Text>)}</View></Pressable>;
}
const styles = StyleSheet.create({ card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }, header: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, title: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '800' }, meta: { color: colors.muted }, description: { color: colors.text, lineHeight: 20 }, skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, skill: { backgroundColor: '#eef2f6', color: colors.muted, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, fontSize: 12 } });
