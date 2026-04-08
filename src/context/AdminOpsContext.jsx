import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { REFERRALS_SEED } from '../pages/Admin/data/referralsSeed';
import { OPENING_BALANCE, TRANSACTIONS_SEED } from '../pages/Admin/data/transactionsSeed';
import { STOCK_SEED } from '../pages/Admin/data/stockSeed';
import { getAuthInstance, getDb, isFirebaseConfigured, omitUndefinedDeep } from '../firebase';
import { DEMO_MODE } from '../utils/demoMode';

// Always use the live keys for real operations (no demo seed data).
const LS_SUFFIX = '-live';
const LS_REF = `luna-admin-referrals-v3${LS_SUFFIX}`;
const LS_AUDIT = `luna-admin-audit-v1${LS_SUFFIX}`;
const LS_TX = `luna-admin-transactions-v1${LS_SUFFIX}`;
const LS_STOCK = `luna-admin-stock-v1${LS_SUFFIX}`;

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readActor() {
  if (typeof window === 'undefined') return { label: 'staff', uid: null, email: null };
  if (isFirebaseConfigured()) {
    const auth = getAuthInstance();
    const u = auth?.currentUser;
    const email = u?.email || null;
    return {
      label: email || u?.uid || localStorage.getItem('luna-admin-user') || 'staff',
      uid: u?.uid || null,
      email,
    };
  }
  return { label: localStorage.getItem('luna-admin-user') || 'staff', uid: null, email: null };
}

const AdminOpsContext = createContext(null);

export function AdminOpsProvider({ children }) {
  const [referrals, setReferrals] = useState(() => loadJSON(LS_REF, []));
  const [auditLog, setAuditLog] = useState(() => loadJSON(LS_AUDIT, []));
  const [transactions, setTransactions] = useState(() => loadJSON(LS_TX, []));
  const [stockItems, setStockItems] = useState(() => loadJSON(LS_STOCK, []));

  // If Firebase is configured, hydrate referrals from the server (newest first).
  useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    const db = getDb();
    if (!db) return undefined;
    let unsub = null;
    (async () => {
      try {
        const { collection, limit, onSnapshot, orderBy, query } = await import('firebase/firestore');

        const inferRoute = (r) => {
          const explicit = String(r?.referredBy || '').trim();
          if (explicit) return explicit;
          const applyingFor = String(r?.applyingFor || '').trim();
          const cap = String(r?.submitterCapacity || '').trim();
          const org = String(r?.submitterOrganisation || '').trim().toLowerCase();
          if (applyingFor !== 'on_behalf') return 'Self-referral';
          if (cap === 'school') return 'School or education';
          if (cap === 'nhs_health') return 'Health visiting (NHS)';
          if (cap === 'social_council') return 'Social care';
          if (cap === 'faith') return 'Faith group';
          if (cap === 'family_friend') return 'Friend or neighbour';
          if (cap === 'charity') {
            if (org.includes('citizens advice') || org.includes('cab')) return 'Citizens Advice (CAB)';
            return 'Charity or community';
          }
          return 'Other';
        };

        const q = query(collection(db, 'referrals'), orderBy('createdAt', 'desc'), limit(200));
        unsub = onSnapshot(
          q,
          (snap) => {
            const rows = snap.docs.map((d) => {
              const data = d.data() || {};
              const createdAt =
                typeof data.createdAt?.toDate === 'function'
                  ? data.createdAt.toDate().toISOString()
                  : String(data.createdAt || data.dateReferred || new Date().toISOString());

              const contactName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim() || data.contactName || '—';
              const adults = Number.parseInt(String(data.adultsCount || 0), 10) || 0;
              const children = Number.parseInt(String(data.childrenCount || 0), 10) || 0;

              const referredBy = inferRoute(data);
              const referrerOrganisation =
                String(data.referrerOrganisation || '').trim() ||
                String(data.submitterOrganisation || '').trim() ||
                (referredBy === 'Self-referral' ? 'Family — direct (no agency)' : '');

              return {
                id: data.id || `REF-${d.id}`,
                familyCode: data.familyCode || `WEB-${String(d.id).slice(-6)}`,
                referredBy,
                referrerOrganisation,
                contactName,
                contactEmail: data.email || data.contactEmail || '',
                dateReferred: createdAt.slice(0, 10),
                priority: data.priority || (String(data.urgencyLevel || '').toLowerCase() === 'urgent' ? 'urgent' : 'medium'),
                status: data.status || 'pending',
                familySize: data.familySize || Math.max(1, adults + children),
                childrenAges: data.childrenAges || [],
                senNeeds: data.senNeeds || [],
                dietaryReqs: data.dietaryReqs || [],
                notes: data.notes || '',
                urgencyReason: data.urgencyReason || '',
                safefoods: data.safefoods || data.safeFoods || [],
                packages: data.packages || [],
                heardAboutUs: data.heardAboutUs || '',
                parcel: data.parcel || undefined,
                updatedAt: data.updatedAt || undefined,
              };
            });
            setReferrals(rows);
          },
          () => {
            // ignore; local cache still works
          }
        );
      } catch {
        // ignore
      }
    })();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // If Firebase is configured, hydrate audit log from the server (newest first).
  useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    const db = getDb();
    if (!db) return undefined;
    let unsub = null;
    (async () => {
      try {
        const { collection, limit, onSnapshot, orderBy, query } = await import('firebase/firestore');
        const q = query(collection(db, 'adminAudit'), orderBy('at', 'desc'), limit(200));
        unsub = onSnapshot(
          q,
          (snap) => {
            const rows = snap.docs.map((d) => d.data());
            setAuditLog(rows);
          },
          () => {
            // ignore; local cache still works
          }
        );
      } catch {
        // ignore
      }
    })();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_REF, JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem(LS_AUDIT, JSON.stringify(auditLog));
  }, [auditLog]);

  useEffect(() => {
    localStorage.setItem(LS_TX, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LS_STOCK, JSON.stringify(stockItems));
  }, [stockItems]);

  const addAudit = useCallback((entry) => {
    const actor = entry.actor || readActor();
    const row = {
      id: uid(),
      at: new Date().toISOString(),
      actor: actor.label,
      actorUid: actor.uid || '',
      actorEmail: actor.email || '',
      action: entry.action,
      entityType: entry.entityType || 'system',
      entityId: entry.entityId || '',
      details: entry.details || '',
    };
    setAuditLog((prev) => [row, ...prev].slice(0, 500));

    // When Firebase is configured, also persist immutable audit rows for deployment.
    if (isFirebaseConfigured()) {
      (async () => {
        try {
          const db = getDb();
          if (!db) return;
          const { addDoc, collection } = await import('firebase/firestore');
          await addDoc(collection(db, 'adminAudit'), omitUndefinedDeep(row));
        } catch (err) {
          console.warn('Audit persist failed', err);
        }
      })();
    }
  }, []);

  const updateReferral = useCallback(
    (id, patch, auditMeta) => {
      setReferrals((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...patch,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
      if (auditMeta) {
        addAudit({
          action: auditMeta.action,
          entityType: 'referral',
          entityId: id,
          details: auditMeta.details || JSON.stringify(patch),
        });
      }
    },
    [addAudit]
  );

  const addTransaction = useCallback(
    (row, auditDetails) => {
      const id = row.id || uid();
      const { receiptDataUrl, receiptFileName, ...rest } = row;
      setTransactions((prev) => [{ ...rest, id, receiptDataUrl, receiptFileName }, ...prev]);
      const proof = receiptDataUrl ? ' (receipt / proof attached)' : '';
      addAudit({
        action: 'transaction_recorded',
        entityType: 'finance',
        entityId: id,
        details: `${auditDetails || row.desc}${proof}`,
      });
    },
    [addAudit]
  );

  const totalLiquidity = useMemo(() => {
    return OPENING_BALANCE + transactions.reduce((acc, t) => acc + t.amt, 0);
  }, [transactions]);

  const stats = useMemo(() => {
    const urgent = referrals.filter(
      (r) => r.priority === 'urgent' || r.status === 'urgent'
    ).length;
    const pending = referrals.filter((r) => r.status === 'pending').length;
    const receivedQueue = referrals.filter((r) =>
      ['pending', 'urgent'].includes(r.status)
    ).length;
    return {
      totalReferrals: referrals.length,
      urgentReferrals: urgent,
      pendingReview: pending,
      receivedReferrals: receivedQueue,
    };
  }, [referrals]);

  const value = useMemo(
    () => ({
      referrals,
      setReferrals,
      updateReferral,
      auditLog,
      addAudit,
      transactions,
      setTransactions,
      addTransaction,
      stockItems,
      setStockItems,
      totalLiquidity,
      stats,
    }),
    [
      referrals,
      updateReferral,
      auditLog,
      addAudit,
      transactions,
      addTransaction,
      stockItems,
      totalLiquidity,
      stats,
    ]
  );

  return <AdminOpsContext.Provider value={value}>{children}</AdminOpsContext.Provider>;
}

export function useAdminOps() {
  const ctx = useContext(AdminOpsContext);
  if (!ctx) throw new Error('useAdminOps must be used within AdminOpsProvider');
  return ctx;
}
