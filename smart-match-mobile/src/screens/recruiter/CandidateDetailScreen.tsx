import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecruiterStackParamList } from '../../navigation/RecruiterNavigator';
import { AppButton } from '../../components/AppButton';
import { SurfaceCard } from '../../components/SurfaceCard';
import { Avatar } from '../../components/Avatar';
import { Chip } from '../../components/Chip';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { StatusBadge } from '../../components/StatusBadge';
import { MatchRing } from '../../components/MatchRing';
import { ProjectCard } from '../../components/ProjectCard';
import { TimelineItem } from '../../components/TimelineItem';
import { SocialRow } from '../../components/SocialRow';
import { applicationService } from '../../services/applicationService';
import { chatService } from '../../services/chatService';
import { computeMatch } from '../../utils/match';
import { ApplicationStatus } from '../../types';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

export function CandidateDetailScreen({ route, navigation }: NativeStackScreenProps<RecruiterStackParamList, 'CandidateDetail'>) {
  const insets = useSafeAreaInsets();
  const { application, recommendation, offer } = route.params;
  const profile = recommendation?.profile;
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [busy, setBusy] = useState(false);

  const name = recommendation?.candidateName || `Candidate #${application.candidateId.slice(0, 8)}`;
  const computed = offer && profile ? computeMatch(profile.skills ?? [], offer.requiredSkills ?? []) : undefined;
  const score = Math.round(recommendation?.matchingScore ?? application.matchingScore ?? computed?.score ?? 0);
  const hasScore = (recommendation?.matchingScore ?? application.matchingScore ?? computed) != null;

  const updateStatus = async (next: ApplicationStatus) => {
    try { setBusy(true); await applicationService.updateStatus(application.id, next); setStatus(next); }
    catch { Alert.alert('Error', 'Could not update application.'); }
    finally { setBusy(false); }
  };
  const message = async () => {
    try { const c = await chatService.start(application.offerId, application.candidateId); navigation.navigate('Chat', { conversationId: c.id }); }
    catch (e: any) { Alert.alert('Could not start chat', e?.response?.data?.message ?? 'Try again later.'); }
  };

  const projects = profile?.projects ?? [];
  const experiences = profile?.experiences ?? [];
  const educations = profile?.educations ?? [];

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
        <StatusBadge status={status} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
        <SurfaceCard style={styles.identity}>
          <View style={styles.idRow}>
            <Avatar name={name} uri={profile?.photoUrl} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{name}</Text>
              {profile?.headline ? <Text style={styles.headline} numberOfLines={2}>{profile.headline}</Text> : null}
              {profile?.location ? <View style={styles.metaRow}><Icon name="location" size={13} color={colors.muted} /><Text style={styles.meta}>{profile.location}</Text></View> : null}
            </View>
            {hasScore ? <MatchRing score={score} size={68} caption={false} /> : null}
          </View>
          {profile?.socials ? <SocialRow socials={profile.socials} /> : null}
          {profile?.cvUrl ? (
            <AppButton title="Open CV" icon="document" variant="secondary" size="sm" onPress={() => Linking.openURL(profile.cvUrl!).catch(() => undefined)} />
          ) : null}
        </SurfaceCard>

        {recommendation?.reasons?.length || recommendation?.gaps?.length ? (
          <SurfaceCard style={styles.card}>
            <Text style={styles.section}>Why this match</Text>
            {recommendation?.reasons?.map((r, i) => (
              <View key={`r${i}`} style={styles.line}><View style={[styles.dot, { backgroundColor: colors.matchHigh }]} /><Text style={styles.lineText}>{r}</Text></View>
            ))}
            {recommendation?.gaps?.map((g, i) => (
              <View key={`g${i}`} style={styles.line}><View style={[styles.dot, { backgroundColor: colors.matchMed }]} /><Text style={styles.lineText}>{g}</Text></View>
            ))}
          </SurfaceCard>
        ) : null}

        {application.message ? (
          <SurfaceCard style={styles.card}>
            <Text style={styles.section}>Application message</Text>
            <Text style={styles.body}>{application.message}</Text>
          </SurfaceCard>
        ) : null}

        {profile?.bio ? (
          <SurfaceCard style={styles.card}><Text style={styles.section}>About</Text><Text style={styles.body}>{profile.bio}</Text></SurfaceCard>
        ) : null}

        {profile?.skills?.length ? (
          <SurfaceCard style={styles.card}>
            <Text style={styles.section}>Skills</Text>
            <View style={styles.chips}>{profile.skills.map((s) => <Chip key={s} label={s} tone={computed?.matched.includes(s) ? 'teal' : 'brand'} />)}</View>
          </SurfaceCard>
        ) : null}

        {projects.length ? (
          <SurfaceCard style={styles.card}>
            <Text style={styles.section}>Portfolio</Text>
            <View style={{ gap: 10 }}>{projects.map((p, i) => <ProjectCard key={i} project={p} onPress={() => p.link && Linking.openURL(p.link).catch(() => undefined)} />)}</View>
          </SurfaceCard>
        ) : null}

        {experiences.length ? (
          <SurfaceCard style={styles.card}>
            <Text style={styles.section}>Experience</Text>
            <View>{experiences.map((ex, i) => <TimelineItem key={i} title={ex.role} subtitle={ex.org} period={[ex.start, ex.current ? 'Present' : ex.end].filter(Boolean).join(' – ')} description={ex.description} last={i === experiences.length - 1} />)}</View>
          </SurfaceCard>
        ) : null}

        {educations.length ? (
          <SurfaceCard style={styles.card}>
            <Text style={styles.section}>Education</Text>
            <View>{educations.map((ed, i) => <TimelineItem key={i} icon="building" title={ed.school} subtitle={[ed.degree, ed.field].filter(Boolean).join(' · ')} period={[ed.start, ed.end].filter(Boolean).join(' – ')} last={i === educations.length - 1} />)}</View>
          </SurfaceCard>
        ) : null}

        {!profile ? (
          <SurfaceCard style={styles.card}>
            <Text style={styles.body}>Full candidate profile loads from the offer's ranked candidates view. From here you can still review the application and update its status.</Text>
          </SurfaceCard>
        ) : null}
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.statusRow}>
          <AppButton title="Interview" size="sm" onPress={() => updateStatus('INTERVIEW')} loading={busy} style={styles.flex} />
          <AppButton title="Accept" size="sm" variant="secondary" onPress={() => updateStatus('ACCEPTED')} style={styles.flex} />
          <AppButton title="Reject" size="sm" variant="danger" onPress={() => updateStatus('REJECTED')} style={styles.flex} />
        </View>
        <AppButton title="Message candidate" icon="chat" variant="ghost" size="sm" onPress={message} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 6 },
  content: { padding: 18, paddingTop: 8, gap: 14 },
  identity: { gap: 12 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  name: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  headline: { color: colors.textSoft, fontSize: 13, fontWeight: '600', marginTop: 2, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  meta: { color: colors.muted, fontWeight: '600', fontSize: 12.5 },
  card: { gap: 11 },
  section: { color: colors.text, fontWeight: '800', fontSize: 16 },
  body: { color: colors.textSoft, fontSize: 14, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  lineText: { flex: 1, color: colors.textSoft, fontSize: 13.5, lineHeight: 19 },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  statusRow: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 }
});
