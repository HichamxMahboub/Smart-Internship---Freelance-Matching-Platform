import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CandidateStackParamList } from '../../navigation/CandidateNavigator';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { LoadingView } from '../../components/LoadingView';
import { StatusBadge } from '../../components/StatusBadge';
import { applicationService } from '../../services/applicationService';
import { favoriteService } from '../../services/favoriteService';
import { offerService } from '../../services/offerService';
import { Offer } from '../../types';
import { colors } from '../../theme/colors';

export function OfferDetailsScreen({ route }: NativeStackScreenProps<CandidateStackParamList, 'OfferDetails'>) {
  const [offer, setOffer] = useState<Offer | undefined>(route.params.offer);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(!route.params.offer);
  useEffect(() => { if (!offer) offerService.get(route.params.offerId).then(setOffer).catch(() => Alert.alert('Error', 'Could not load offer.')).finally(() => setLoading(false)); }, []);
  const apply = async () => { try { await applicationService.apply({ offerId: route.params.offerId, message }); Alert.alert('Application sent', 'Your application was submitted.'); } catch (error: any) { Alert.alert('Could not apply', error?.response?.data?.message ?? 'You may have already applied or your email is not verified.'); } };
  const favorite = async () => { try { await favoriteService.add(route.params.offerId); Alert.alert('Saved', 'Offer added to favorites.'); } catch (error: any) { Alert.alert('Could not save', error?.response?.data?.message ?? 'Offer may already be saved.'); } };
  const unfavorite = async () => { try { await favoriteService.remove(route.params.offerId); Alert.alert('Removed', 'Offer removed from favorites.'); } catch { Alert.alert('Could not remove favorite'); } };
  if (loading || !offer) return <LoadingView />;
  return <ScrollView style={styles.container}><View style={styles.card}><Text style={styles.title}>{offer.title}</Text><StatusBadge status={offer.type} /><Text style={styles.meta}>{offer.location} · {offer.duration}</Text><Text style={styles.description}>{offer.description}</Text><View style={styles.skills}>{offer.requiredSkills.map((skill) => <Text style={styles.skill} key={skill}>{skill}</Text>)}</View><AppInput label="Application message" value={message} onChangeText={setMessage} multiline style={{ minHeight: 90 }} /><AppButton title="Apply" onPress={apply} /><AppButton title="Add favorite" variant="secondary" onPress={favorite} /><AppButton title="Remove favorite" variant="secondary" onPress={unfavorite} /></View></ScrollView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, padding: 16 }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }, title: { fontSize: 24, fontWeight: '900', color: colors.text }, meta: { color: colors.muted }, description: { color: colors.text, lineHeight: 22 }, skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, skill: { backgroundColor: colors.primaryLight, color: colors.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 } });
