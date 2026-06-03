import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { Project } from '../types';
import { Icon } from './Icon';

/** Portfolio project tile for the candidate profile / recruiter candidate view. */
export function ProjectCard({ project, onPress, onEdit }: { project: Project; onPress?: () => void; onEdit?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.thumb}>
        {project.imageUrl ? (
          <Image source={{ uri: project.imageUrl }} style={styles.img} />
        ) : (
          <Icon name="briefcase" size={22} color={colors.primary} bg={colors.primaryLight} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
        {project.description ? <Text style={styles.desc} numberOfLines={2}>{project.description}</Text> : null}
        {project.link ? (
          <View style={styles.linkRow}>
            <Icon name="globe" size={12} color={colors.primary} />
            <Text style={styles.link} numberOfLines={1}>{project.link.replace(/^https?:\/\//, '')}</Text>
          </View>
        ) : null}
      </View>
      {onEdit ? (
        <Pressable hitSlop={8} onPress={onEdit} style={styles.editBtn}>
          <Icon name="edit" size={14} color={colors.muted} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 12, ...shadow.xs },
  pressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
  thumb: { width: 54, height: 54, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  body: { flex: 1, gap: 3, justifyContent: 'center' },
  title: { color: colors.text, fontWeight: '800', fontSize: 14.5, letterSpacing: -0.2 },
  desc: { color: colors.muted, fontSize: 12.5, lineHeight: 17 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 12, flex: 1 },
  editBtn: { padding: 4, alignSelf: 'flex-start' }
});
