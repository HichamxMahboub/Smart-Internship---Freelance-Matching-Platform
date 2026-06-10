import React, { useCallback, useRef, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecruiterStackParamList } from '../../navigation/RecruiterNavigator';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SurfaceCard } from '../../components/SurfaceCard';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { Avatar } from '../../components/Avatar';
import { Icon } from '../../components/Icon';
import { paymentService } from '../../services/paymentService';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

const QUICK_AMOUNTS = [100, 250, 500, 1000];

export function PayCandidateScreen({ route, navigation }: NativeStackScreenProps<RecruiterStackParamList, 'PayCandidate'>) {
  const { application, offer, candidateName } = route.params;
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const confirming = useRef(false);

  const name = candidateName || `Candidate #${application.candidateId.slice(0, 8)}`;
  const numericAmount = Number(amount.replace(',', '.'));
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0;

  const startCheckout = async () => {
    if (!validAmount) { Alert.alert('Amount required', 'Enter an amount greater than 0.'); return; }
    try {
      setBusy(true);
      const session = await paymentService.freelanceCheckout(application.id, numericAmount, undefined, note.trim() || undefined);
      setPendingId(session.paymentId);
      const opened = await Linking.canOpenURL(session.url);
      if (opened) await Linking.openURL(session.url);
      else Alert.alert('Open checkout', 'Could not open the payment page automatically.');
    } catch (e: any) {
      Alert.alert('Payment error', e?.response?.data?.message ?? 'Could not start the payment. Make sure Stripe is configured.');
    } finally {
      setBusy(false);
    }
  };

  const confirm = useCallback(async (silent = false) => {
    if (!pendingId || confirming.current) return;
    confirming.current = true;
    try {
      const payment = await paymentService.confirm(pendingId);
      if (payment.status === 'PAID') {
        setPendingId(null);
        Alert.alert('Payment sent', `${name} has been paid ${payment.amount} ${payment.currency}.`, [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else if (!silent) {
        Alert.alert('Not completed yet', 'We could not confirm the payment. Finish it in the browser, then tap "I have paid".');
      }
    } catch {
      if (!silent) Alert.alert('Error', 'Could not verify the payment yet. Try again in a moment.');
    } finally {
      confirming.current = false;
    }
  }, [pendingId, name, navigation]);

  // When the recruiter returns from the Stripe page the screen regains focus — auto-verify.
  useFocusEffect(useCallback(() => {
    if (pendingId) { void confirm(true); }
  }, [pendingId, confirm]));

  return (
    <View style={styles.container}>
      <ScreenHeader title="Pay candidate" subtitle={offer?.title ?? 'Freelance mission'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <SurfaceCard style={styles.who}>
          <Avatar name={name} size={46} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {offer?.title ? <Text style={styles.role} numberOfLines={1}>{offer.title}</Text> : null}
          </View>
          <View style={styles.freelanceTag}><Text style={styles.freelanceTagText}>FREELANCE</Text></View>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.section}>Amount</Text>
          <AppInput value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" icon="briefcase" />
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((q) => (
              <AppButton key={q} title={`${q}`} size="sm" variant="secondary" onPress={() => setAmount(String(q))} style={styles.quick} />
            ))}
          </View>
          <AppInput label="Note (optional)" value={note} onChangeText={setNote} placeholder="Milestone 1 — landing page" multiline />
        </SurfaceCard>

        <View style={styles.infoRow}>
          <Icon name="shield" size={15} color={colors.muted} />
          <Text style={styles.infoText}>Payments are processed securely by Stripe. Use a test card (e.g. 4242 4242 4242 4242) in test mode.</Text>
        </View>

        {pendingId ? (
          <SurfaceCard style={styles.pendingCard}>
            <Text style={styles.pendingTitle}>Finish the payment in your browser</Text>
            <Text style={styles.pendingSub}>Once you complete it, come back and confirm.</Text>
            <AppButton title="I have paid — confirm" icon="check" onPress={() => confirm(false)} />
            <AppButton title="Reopen payment page" variant="ghost" size="sm" onPress={startCheckout} />
          </SurfaceCard>
        ) : (
          <AppButton title={validAmount ? `Pay ${numericAmount} with card` : 'Pay with card'} icon="check" onPress={startCheckout} loading={busy} disabled={!validAmount} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingTop: 4, gap: 14, paddingBottom: 36 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: colors.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  role: { color: colors.muted, fontSize: 12.5, fontWeight: '600', marginTop: 2 },
  freelanceTag: { backgroundColor: colors.primaryLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  freelanceTagText: { color: colors.primary, fontWeight: '800', fontSize: 10.5, letterSpacing: 0.5 },
  card: { gap: 11 },
  section: { color: colors.text, fontWeight: '800', fontSize: 16 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quick: { flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4 },
  infoText: { flex: 1, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  pendingCard: { gap: 10 },
  pendingTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  pendingSub: { color: colors.muted, fontSize: 13, lineHeight: 18 }
});
