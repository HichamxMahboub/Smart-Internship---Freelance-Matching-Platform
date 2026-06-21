import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { aiService } from '../services/aiService';
import { MatchItem } from '../types';

/**
 * Fetches the candidate's real AI offer matches once (OpenRouter-scored on the backend) and shares
 * them across the candidate screens so offer cards, the home list and the offer detail all show the
 * same AI score. Screens fall back to the local skill-overlap heuristic while this is loading or if
 * the AI engine is unavailable.
 */
interface CandidateMatchValue {
  matches: Record<string, MatchItem>;
  loading: boolean;
  ready: boolean;
  scoreFor: (offerId?: string) => number | undefined;
  matchFor: (offerId?: string) => MatchItem | undefined;
  refresh: () => Promise<void>;
}

const CandidateMatchContext = createContext<CandidateMatchValue | undefined>(undefined);

export function CandidateMatchProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Record<string, MatchItem>>({});
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const loadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const list = await aiService.candidateMatches();
      const map: Record<string, MatchItem> = {};
      list.forEach((m) => { if (m.offerId) map[m.offerId] = m; });
      setMatches(map);
      setReady(true);
    } catch {
      // Keep any previous matches; screens fall back to the heuristic when a score is missing.
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo<CandidateMatchValue>(() => ({
    matches,
    loading,
    ready,
    scoreFor: (offerId) => (offerId && matches[offerId] ? matches[offerId].score : undefined),
    matchFor: (offerId) => (offerId ? matches[offerId] : undefined),
    refresh
  }), [matches, loading, ready, refresh]);

  return <CandidateMatchContext.Provider value={value}>{children}</CandidateMatchContext.Provider>;
}

export function useCandidateMatches() {
  const context = useContext(CandidateMatchContext);
  if (!context) throw new Error('useCandidateMatches must be used inside CandidateMatchProvider');
  return context;
}
