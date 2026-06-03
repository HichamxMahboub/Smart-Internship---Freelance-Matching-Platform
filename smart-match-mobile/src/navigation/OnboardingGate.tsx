import React, { useCallback, useEffect, useState } from 'react';
import { LoadingView } from '../components/LoadingView';
import { CandidateOnboarding } from '../screens/onboarding/CandidateOnboarding';
import { RecruiterOnboarding } from '../screens/onboarding/RecruiterOnboarding';
import { profileService } from '../services/profileService';
import { companyService } from '../services/companyService';
import { isCandidateComplete, isRecruiterComplete } from '../onboarding/completeness';
import { User } from '../types';

/**
 * Mandatory post-signup gate. Blocks the main app until a candidate has the
 * essentials (headline + skills + CV) or a recruiter has a company. Renders the
 * matching onboarding flow until complete, then hands control to children.
 */
export function OnboardingGate({ user, children }: { user: User; children: React.ReactNode }) {
  const isRecruiter = user.role === 'RECRUITER';
  const [checking, setChecking] = useState(true);
  const [complete, setComplete] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      if (isRecruiter) {
        const company = await companyService.getMine().catch(() => null);
        setComplete(isRecruiterComplete(company));
      } else {
        const profile = await profileService.getCandidateProfile().catch(() => null);
        setComplete(isCandidateComplete(profile));
      }
    } finally {
      setChecking(false);
    }
  }, [isRecruiter]);

  useEffect(() => { check(); }, [check]);

  if (checking) return <LoadingView label="Preparing your workspace…" />;
  if (complete) return <>{children}</>;
  return isRecruiter ? <RecruiterOnboarding onDone={() => setComplete(true)} /> : <CandidateOnboarding onDone={() => setComplete(true)} />;
}
