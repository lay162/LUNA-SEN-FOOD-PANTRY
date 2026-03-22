import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '../firebase';

/**
 * Live “Recent impact” figures for the public Donate page.
 *
 * Firestore: document `public/impactStats` (readable by everyone; update via Console or admin tools).
 * Fields (all optional — only set what you want to show):
 * - familiesHelpedThisMonth: number
 * - senRequirementsPercent: number (e.g. 89 → displayed as 89%)
 * - foodDistributedTonnes: number (e.g. 2.4 → displayed as 2.4t)
 * - donatedThisMonthGbp: number (e.g. 12000 → displayed as £12k)
 */
const IMPACT_DOC = ['public', 'impactStats'];

function hasAnyValue(data) {
  if (!data || typeof data !== 'object') return false;
  return ['familiesHelpedThisMonth', 'senRequirementsPercent', 'foodDistributedTonnes', 'donatedThisMonthGbp'].some(
    (k) => {
      const v = data[k];
      return v !== undefined && v !== null && v !== '' && !Number.isNaN(Number(v));
    }
  );
}

export function formatFamiliesHelped(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  return String(Math.round(x));
}

export function formatSenPercent(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  return `${Math.round(x)}%`;
}

export function formatFoodTonnes(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  const t = x >= 10 ? x.toFixed(1) : x.toFixed(1).replace(/\.0$/, '');
  return `${t}t`;
}

export function formatDonatedGbp(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  if (x >= 1000) return `£${Math.round(x / 1000)}k`;
  return `£${Math.round(x)}`;
}

export function usePublicImpactStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    if (!isFirebaseConfigured()) {
      setLoading(false);
      setStats(null);
      return undefined;
    }

    const db = getDb();
    if (!db) {
      setLoading(false);
      setStats(null);
      return undefined;
    }

    try {
      const ref = doc(db, IMPACT_DOC[0], IMPACT_DOC[1]);
      unsubscribe = onSnapshot(
        ref,
        (snap) => {
          setLoading(false);
          setStats(snap.exists() ? snap.data() : null);
        },
        () => {
          setLoading(false);
          setStats(null);
        }
      );
    } catch {
      setLoading(false);
      setStats(null);
    }

    return () => unsubscribe();
  }, []);

  const hasLiveStats = hasAnyValue(stats);

  return {
    stats,
    loading,
    hasLiveStats,
    families: formatFamiliesHelped(stats?.familiesHelpedThisMonth),
    senPercent: formatSenPercent(stats?.senRequirementsPercent),
    foodTonnes: formatFoodTonnes(stats?.foodDistributedTonnes),
    donated: formatDonatedGbp(stats?.donatedThisMonthGbp)
  };
}
