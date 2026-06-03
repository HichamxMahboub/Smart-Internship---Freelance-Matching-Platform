import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SurfaceCard } from '../../components/SurfaceCard';
import { EmptyState } from '../../components/EmptyState';
import { Chip } from '../../components/Chip';
import { MatchRing } from '../../components/MatchRing';
import { Icon, IconName } from '../../components/Icon';
import { aiService } from '../../services/aiService';
import { AIResult } from '../../types';
import { colors } from '../../theme/colors';
import { radius, shadow } from '../../theme/spacing';

export function AIRecommendationsScreen() {
  const [result, setResult] = useState<AIResult | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const run = async (type: 'CV_ANALYSIS' | 'OFFER_RECOMMENDATION') => {
    try { setRunning(type); const job = await aiService.createJob(type); setResult(await aiService.getResult(job.id)); }
    catch (e: any) { Alert.alert('AI unavailable', e?.response?.data?.message ?? 'A premium plan may be required.'); }
    finally { setRunning(null); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.intro}>
        <View style={styles.introIcon}><Icon name="sparkles" size={24} color={colors.primary} bg={colors.primaryLight} /></View>
        <Text style={styles.introTitle}>AI-powered insights</Text>
        <Text style={styles.introSub}>Run an analysis to see your match score, strengths, and tailored recommendations.</Text>
      </View>

      <ActionCard icon="document" title="CV analysis" caption="Strengths, gaps & extracted skills" loading={running === 'CV_ANALYSIS'} onPress={() => run('CV_ANALYSIS')} />
      <ActionCard icon="briefcase" title="Offer recommendations" caption="Roles tailored to your profile" loading={running === 'OFFER_RECOMMENDATION'} onPress={() => run('OFFER_RECOMMENDATION')} />

      {result ? (
        <SurfaceCard style={styles.result}>
          {typeof result.score === 'number' ? (
            <View style={styles.scoreRow}>
              <MatchRing score={result.score} size={84} caption={false} />
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>{result.recommendation || 'Analysis ready'}</Text>
                {result.extractedSkills?.length ? (
                  <View style={styles.skills}>{result.extractedSkills.slice(0, 6).map((s) => <Chip key={s} label={s} tone="teal" />)}</View>
                ) : null}
              </View>
            </View>
          ) : (
            <Text style={styles.resultTitle}>{result.recommendation || 'Analysis ready'}</Text>
          )}
          {result.profileType || result.seniority ? (
            <View style={styles.identity}>
              {result.profileType ? <Text style={styles.identityRole}>{result.profileType}</Text> : null}
              {result.seniority ? <Text style={styles.identitySeniority}>{result.seniority}</Text> : null}
            </View>
          ) : null}
          {result.conclusion ? <Text style={styles.conclusion}>{result.conclusion}</Text> : null}
          {result.details ? <Text style={styles.details}>{result.details}</Text> : null}
        </SurfaceCard>
      ) : (
        <EmptyState icon="sparkles" title="No analysis yet" message="Pick an action above to generate AI insights for your profile." />
      )}
    </ScrollView>
  );
}

function ActionCard({ icon, title, caption, loading, onPress }: { icon: IconName; title: string; caption: string; loading: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [styles.action, pressed && { opacity: 0.92 }, loading && { opacity: 0.7 }]}>
      <View style={styles.actionIcon}><Icon name={icon} size={22} color={colors.primary} bg={colors.primaryLight} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionCaption}>{caption}</Text>
      </View>
      <Text style={styles.actionCta}>{loading ? 'Running…' : 'Run'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, gap: 13, paddingBottom: 30 },
  intro: { alignItems: 'center', gap: 8, paddingVertical: 8, marginBottom: 2 },
  introIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  introTitle: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  introSub: { color: colors.muted, textAlign: 'center', lineHeight: 21, fontSize: 14 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, ...shadow.xs },
  actionIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: colors.text, fontWeight: '800', fontSize: 15.5 },
  actionCaption: { color: colors.muted, fontSize: 12.5, fontWeight: '500' },
  actionCta: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  result: { gap: 14, marginTop: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scoreCircle: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { color: colors.primary, fontSize: 26, fontWeight: '800' },
  scoreUnit: { color: colors.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultTitle: { color: colors.text, fontWeight: '800', fontSize: 16, lineHeight: 22 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  source: { color: colors.primary, fontWeight: '700', fontSize: 12.5 },
  details: { color: colors.textSoft, lineHeight: 22, fontSize: 14 },
  identity: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  identityRole: { color: colors.primary, fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  identitySeniority: { color: colors.white, backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  conclusion: { color: colors.text, fontWeight: '700', fontSize: 14, lineHeight: 21 }
});
