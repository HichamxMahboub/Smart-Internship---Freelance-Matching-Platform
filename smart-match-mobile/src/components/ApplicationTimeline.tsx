import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { ApplicationStatus } from '../types';
import { colors } from '../theme/colors';

interface Props {
  status: ApplicationStatus;
  appliedAt?: string;
  reviewedAt?: string;
  decidedAt?: string;
}

const fmt = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export function ApplicationTimeline({ status, appliedAt, reviewedAt, decidedAt }: Props) {
  const reviewed = status !== 'PENDING';
  const decided = status === 'ACCEPTED' || status === 'REJECTED';
  const rejected = status === 'REJECTED';
  const accepted = status === 'ACCEPTED';
  const interviewing = status === 'INTERVIEW';

  const decisionLabel = accepted ? 'Accepted' : rejected ? 'Rejected' : 'Decision';
  const decisionIcon: IconName = accepted ? 'check' : rejected ? 'close' : 'star';
  const decisionTone = decided
    ? (accepted ? colors.success : colors.danger)
    : interviewing ? colors.primary : colors.muted;

  return (
    <View style={styles.wrap}>
      <Step
        index={1}
        title="Applied"
        date={fmt(appliedAt)}
        icon="document"
        active
        done
        tone={colors.primary}
      />
      <Connector done={reviewed} />
      <Step
        index={2}
        title={interviewing ? 'Interview' : 'Reviewed'}
        date={fmt(reviewedAt)}
        icon={interviewing ? 'chat' : 'search'}
        active={reviewed}
        done={reviewed}
        tone={reviewed ? (interviewing ? colors.primary : colors.success) : colors.muted}
      />
      <Connector done={decided} />
      <Step
        index={3}
        title={decisionLabel}
        date={fmt(decidedAt)}
        icon={decisionIcon}
        active={decided}
        done={decided}
        tone={decisionTone}
      />
    </View>
  );
}

function Step({ title, date, icon, active, done, tone }: {
  index: number; title: string; date: string; icon: IconName; active: boolean; done: boolean; tone: string;
}) {
  return (
    <View style={styles.step}>
      <View style={[styles.dot, { borderColor: tone, backgroundColor: done ? tone : colors.white }]}>
        <Icon name={icon} size={12} color={done ? colors.white : tone} />
      </View>
      <Text style={[styles.title, { color: active ? colors.text : colors.muted }]} numberOfLines={1}>{title}</Text>
      {date ? <Text style={styles.date}>{date}</Text> : <Text style={styles.dateMuted}>—</Text>}
    </View>
  );
}

function Connector({ done }: { done: boolean }) {
  return <View style={[styles.line, { backgroundColor: done ? colors.success : colors.border }]} />;
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 4 },
  step: { alignItems: 'center', gap: 5, width: 88 },
  dot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 12, marginTop: 2, textAlign: 'center' },
  date: { color: colors.muted, fontSize: 10.5, fontWeight: '600', textAlign: 'center' },
  dateMuted: { color: colors.softText, fontSize: 10.5, fontWeight: '600' },
  line: { flex: 1, height: 2, borderRadius: 1, marginTop: 14 }
});
