import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { aiService } from '../../services/aiService';
import { AIResult } from '../../types';
import { colors } from '../../theme/colors';

export function AIRecommendationsScreen() { const [result, setResult] = useState<AIResult | null>(null); const run = async (type: 'CV_ANALYSIS' | 'OFFER_RECOMMENDATION') => { try { const job = await aiService.createJob(type); setResult(await aiService.getResult(job.id)); } catch (e: any) { Alert.alert('AI unavailable', e?.response?.data?.message ?? 'Premium plan may be required.'); } }; return <View style={styles.container}><Text style={styles.title}>AI recommendations</Text><AppButton title="Run CV analysis" onPress={() => run('CV_ANALYSIS')} /><AppButton title="Run offer recommendation" variant="secondary" onPress={() => run('OFFER_RECOMMENDATION')} />{result ? <View style={styles.card}><Text style={styles.score}>Score: {result.score ?? '-'}</Text><Text style={styles.recommendation}>{result.recommendation}</Text><Text style={styles.details}>{result.details}</Text></View> : null}</View>; }
const styles = StyleSheet.create({ container: { flex: 1, padding: 16, gap: 14, backgroundColor: colors.background }, title: { fontSize: 26, fontWeight: '900', color: colors.text }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border }, score: { fontSize: 20, fontWeight: '800', color: colors.primary }, recommendation: { color: colors.text, lineHeight: 22 }, details: { color: colors.muted } });
