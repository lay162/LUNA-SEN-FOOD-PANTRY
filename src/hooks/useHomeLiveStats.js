import { useEffect, useMemo, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '../firebase';

function safeInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

async function countDocs(db, colName, filters = []) {
  const base = collection(db, colName);
  const q = filters.length ? query(base, ...filters) : query(base);
  const snap = await getCountFromServer(q);
  return safeInt(snap.data().count);
}

/**
 * Lightweight “near real-time” public counters for the Home mini stats carousel.
 * Uses Firestore aggregation count queries (no document downloads).
 *
 * Collections used:
 * - referrals: public support/referral submissions and ops statuses
 * - volunteers: volunteer applications
 * - stories: public thank you messages
 */
export function useHomeLiveStats({ pollMs = 45_000 } = {}) {
  const firebaseReady = useMemo(() => isFirebaseConfigured(), []);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    referralsTaken: 0,
    referralsDelivered: 0,
    referralsPending: 0,
    volunteerApplications: 0,
    publicMessages: 0,
  });

  useEffect(() => {
    let alive = true;
    let t = null;

    const run = async () => {
      if (!firebaseReady) {
        if (!alive) return;
        setLoading(false);
        setCounts({
          referralsTaken: 0,
          referralsDelivered: 0,
          referralsPending: 0,
          volunteerApplications: 0,
          publicMessages: 0,
        });
        return;
      }

      const db = getDb();
      if (!db) {
        if (!alive) return;
        setLoading(false);
        return;
      }

      try {
        const [taken, delivered, pending, volunteerApps, messages] = await Promise.all([
          countDocs(db, 'referrals'),
          countDocs(db, 'referrals', [where('status', '==', 'delivered')]),
          countDocs(db, 'referrals', [where('status', '==', 'pending')]),
          countDocs(db, 'volunteers'),
          countDocs(db, 'stories'),
        ]);

        if (!alive) return;
        setCounts({
          referralsTaken: taken,
          referralsDelivered: delivered,
          referralsPending: pending,
          volunteerApplications: volunteerApps,
          publicMessages: messages,
        });
      } catch {
        // ignore — keep last counts
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    t = window.setInterval(run, Math.max(10_000, safeInt(pollMs)));
    return () => {
      alive = false;
      if (t) window.clearInterval(t);
    };
  }, [firebaseReady, pollMs]);

  return {
    loading,
    ...counts,
  };
}

