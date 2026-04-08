import React, { useEffect, useMemo, useState } from 'react';
import { useAdminOps } from '../../context/AdminOpsContext';
import AdminPanelModal from './components/AdminPanelModal';
import { getAllowlistEntries } from './utils/adminAuth';

function displayLspId(id) {
  return id.replace(/^REF/i, 'LSP');
}

function statusDisplayLabel(status) {
  if (status === 'pending') return 'received';
  return status;
}

const REFERRALS_PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

function referralAccent(ref) {
  if (ref.priority === 'urgent' || ref.status === 'urgent') return 'urgent';
  if (ref.priority === 'high') return 'high';
  if (ref.status === 'active') return 'active';
  if (ref.status === 'pending') return 'pending';
  if (ref.priority === 'medium') return 'medium';
  return 'default';
}

function priorityMetaClass(priority) {
  if (priority === 'urgent') return 'admin-panel__referral-strip__pri--urgent';
  if (priority === 'high') return 'admin-panel__referral-strip__pri--high';
  if (priority === 'medium') return 'admin-panel__referral-strip__pri--medium';
  return 'admin-panel__referral-strip__pri--standard';
}

function referrerPlace(ref) {
  return (ref.referrerOrganisation || ref.referredBy || '—').trim();
}

function referrerRoute(ref) {
  return (ref.referredBy || 'Referral').trim();
}

export default function ReferralManagement() {
  const { referrals, updateReferral, addAudit, stockItems, setStockItems } = useAdminOps();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [listPage, setListPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selected, setSelected] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [packLines, setPackLines] = useState([]);
  const [packNote, setPackNote] = useState('');
  const [driverEmail, setDriverEmail] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getAllowlistEntries();
        const d = rows.filter((r) => r.role === 'driver' && r.active !== false);
        if (alive) setDrivers(d);
      } catch {
        if (alive) setDrivers([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const existing = selected.parcel?.items || [];
    setPackLines(existing.length ? existing : []);
    setPackNote(selected.parcel?.packNote || '');
    setDriverEmail(selected.parcel?.assignedDriverEmail || '');
  }, [selected]);

  const statusOptions = [
    { id: 'all', name: 'All referrals' },
    { id: 'urgent', name: 'Urgent / crisis' },
    { id: 'pending', name: 'Pending review' },
    { id: 'active', name: 'Active support' },
  ];

  const routeOptions = useMemo(() => {
    const ROUTE_ORDER = [
      'GP practice',
      'School or education',
      'Citizens Advice (CAB)',
      'Charity or community',
      'Health visiting (NHS)',
      'Social care',
      'Faith group',
      'Self-referral',
      'Friend or neighbour',
    ];
    const OTHER_ROUTE_ID = '__other__';
    const PINNED_ROUTES = ['Citizens Advice (CAB)'];
    const toneForRoute = (label) => {
      if (label === 'GP practice') return 'gp';
      if (label === 'School or education') return 'school';
      if (label === 'Citizens Advice (CAB)') return 'charity';
      if (label === 'Charity or community') return 'charity';
      if (label === 'Health visiting (NHS)') return 'nhs';
      if (label === 'Social care') return 'social';
      if (label === 'Faith group') return 'faith';
      if (label === 'Self-referral') return 'self';
      if (label === 'Friend or neighbour') return 'friend';
      return 'other';
    };
    const unique = new Set(
      referrals
        .map((r) => String(r.referredBy || '').trim())
        .filter(Boolean)
    );
    const ordered = ROUTE_ORDER.filter((r) => unique.has(r));
    const remaining = [...unique].filter((r) => !ROUTE_ORDER.includes(r)).sort((a, b) => a.localeCompare(b));
    const normalize = (r) => ({ id: r, name: r, tone: toneForRoute(r) });
    const pinnedMissing = PINNED_ROUTES.filter((r) => !unique.has(r));
    const showOtherBucket = remaining.length > 0;
    return [
      { id: 'all', name: 'All routes', tone: 'all' },
      ...ordered.map(normalize),
      ...pinnedMissing.map(normalize),
      ...(showOtherBucket ? [{ id: OTHER_ROUTE_ID, name: 'Other routes', tone: 'other' }] : []),
      ...remaining.map(normalize),
    ];
  }, [referrals]);

  const filtered = useMemo(() => {
    const knownRoutes = new Set([
      'GP practice',
      'School or education',
      'Citizens Advice (CAB)',
      'Charity or community',
      'Health visiting (NHS)',
      'Social care',
      'Faith group',
      'Self-referral',
      'Friend or neighbour',
    ]);
    return referrals.filter((referral) => {
      if (selectedStatus === 'urgent') {
        if (referral.priority !== 'urgent' && referral.status !== 'urgent') return false;
      } else if (selectedStatus !== 'all') {
        if (referral.status !== selectedStatus) return false;
      }
      if (selectedRoute !== 'all') {
        const route = String(referral.referredBy || '').trim();
        if (selectedRoute === '__other__') {
          if (!route || knownRoutes.has(route)) return false;
        } else if (route !== selectedRoute) {
          return false;
        }
      }
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return (
        referral.familyCode.toLowerCase().includes(q) ||
        referral.referredBy.toLowerCase().includes(q) ||
        String(referral.referrerOrganisation || '')
          .toLowerCase()
          .includes(q) ||
        referral.contactName.toLowerCase().includes(q) ||
        referral.id.toLowerCase().includes(q)
      );
    });
  }, [referrals, selectedStatus, selectedRoute, searchTerm]);

  useEffect(() => {
    setListPage(1);
  }, [selectedStatus, selectedRoute, searchTerm, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const listPageSafe = Math.min(listPage, totalPages);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filtered.length / pageSize));
    setListPage((p) => Math.min(p, tp));
  }, [filtered.length, pageSize]);

  const pageSlice = useMemo(() => {
    const start = (listPageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, listPageSafe, pageSize]);

  const rangeLabel = useMemo(() => {
    if (!filtered.length) return '0 referrals';
    const from = (listPageSafe - 1) * pageSize + 1;
    const to = Math.min(listPageSafe * pageSize, filtered.length);
    return `Showing ${from}–${to} of ${filtered.length}`;
  }, [filtered.length, listPageSafe, pageSize]);

  const handleApproveDispatch = () => {
    if (!selected) return;
    updateReferral(
      selected.id,
      {
        status: 'active',
        nextAction: 'Parcel dispatched — confirm receipt with family',
        lastContact: 'Just now (staff)',
        parcel: {
          ...(selected.parcel || {}),
          status: 'loaded_in_van',
          loadedAt: new Date().toISOString(),
        },
      },
      {
        action: 'referral_approved_dispatch',
        details: `Approved and dispatched for ${selected.familyCode} (loaded in van)`,
      }
    );
    setSelected(null);
  };

  const addPackLine = () => {
    setPackLines((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, sku: '', name: '', qty: 1 },
    ]);
  };

  const updatePackLine = (id, patch) => {
    setPackLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removePackLine = (id) => {
    setPackLines((prev) => prev.filter((l) => l.id !== id));
  };

  const markPackedAndAssign = () => {
    if (!selected) return;
    const cleaned = packLines
      .map((l) => ({ ...l, qty: Number(l.qty || 0) }))
      .filter((l) => (l.sku || l.name) && l.qty > 0);

    // Decrement stock (best-effort by SKU)
    if (cleaned.length) {
      setStockItems((prev) =>
        prev.map((s) => {
          const used = cleaned.find((l) => l.sku && l.sku.toLowerCase() === String(s.sku).toLowerCase());
          if (!used) return s;
          return { ...s, current: Math.max(0, Number(s.current || 0) - Number(used.qty || 0)) };
        })
      );
      addAudit({
        action: 'stock_decremented_for_parcel',
        entityType: 'referral',
        entityId: selected.id,
        details: `Stock decremented for parcel (${cleaned.length} line items)`,
      });
    }

    updateReferral(
      selected.id,
      {
        parcel: {
          ...(selected.parcel || {}),
          status: 'packed',
          packedAt: new Date().toISOString(),
          packedItemsCount: cleaned.reduce((acc, l) => acc + Number(l.qty || 0), 0),
          items: cleaned,
          packNote,
          assignedDriverEmail: driverEmail || '',
        },
        nextAction: driverEmail ? 'Assigned to driver — ready to load van' : 'Packed — assign driver & load van',
      },
      {
        action: 'parcel_packed',
        details: `Packed parcel (${cleaned.length} lines)${driverEmail ? ` · driver ${driverEmail}` : ''}`,
      }
    );
    setSelected(null);
  };

  const handleMarkReviewed = () => {
    if (!selected) return;
    updateReferral(
      selected.id,
      { status: 'pending', nextAction: 'Follow-up scheduled' },
      {
        action: 'referral_marked_reviewed',
        details: `Case reviewed ${selected.familyCode}`,
      }
    );
    setSelected(null);
  };

  const handleRequestInfo = () => {
    if (!selected) return;
    addAudit({
      action: 'referral_more_info_requested',
      entityType: 'referral',
      entityId: selected.id,
      details: `Requested further information for ${selected.familyCode}`,
    });
    setSelected(null);
  };

  return (
    <div className="admin-panel__fade-in admin-panel__page">
      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <div className="admin-panel__page-head">
            <div>
              <h2 className="admin-panel__referrals-title">Received referrals</h2>
              <p className="admin-panel__referrals-lede mt-2">
                Review referral forms and record decisions. Referrals can come from{' '}
                <span className="font-semibold text-gray-700">schools and professionals</span>, or{' '}
                <span className="font-semibold text-gray-700">directly from families and personal contacts</span>. Every
                action is saved to the audit log.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__referrals-toolbar">
        <div className="admin-panel__card admin-panel__card--shadow admin-panel__referrals-toolbar__filter">
          <div className="admin-panel__card-pad admin-panel__referrals-filter-card">
            <p className="admin-panel__label mb-3">Filter</p>
            <div className="admin-panel__referrals-filter-row">
              {statusOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedStatus(option.id)}
                  className={`admin-panel__btn admin-panel__btn--outline admin-panel__btn--pill admin-panel__filter-pill admin-panel__filter-pill--${option.id} ${
                    selectedStatus === option.id ? 'admin-panel__btn--pill-active' : ''
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
            <p className="admin-panel__label mb-3 mt-5">Route</p>
            <div className="admin-panel__referrals-filter-row">
              {routeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedRoute(option.id)}
                  className={`admin-panel__btn admin-panel__btn--outline admin-panel__btn--pill admin-panel__filter-pill admin-panel__filter-pill--${option.tone || 'all'} ${
                    selectedRoute === option.id ? 'admin-panel__btn--pill-active' : ''
                  }`}
                  title={option.name}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-panel__card admin-panel__card--shadow admin-panel__referrals-toolbar__search">
          <div className="admin-panel__card-pad admin-panel__referrals-search-card">
            <label className="admin-panel__label" htmlFor="referral-search">
              Search
            </label>
            <input
              id="referral-search"
              type="search"
              className="admin-panel__input admin-panel__referrals-search-input"
              placeholder="Family code, organisation, route (GP, school…), contact name, ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed py-14 text-center text-sm font-medium"
          style={{ color: 'var(--luna-grey-500)', borderColor: 'var(--luna-grey-200)' }}
        >
          No referrals match your filters.
        </div>
      ) : (
        <div className="admin-panel__card admin-panel__card--shadow">
          <div className="admin-panel__card-pad admin-panel__card-pad--sm">
            <div className="admin-panel__referrals-list">
              {pageSlice.map((ref) => {
                const accent = referralAccent(ref);
                const priClass = priorityMetaClass(ref.priority);
                return (
                  <div
                    key={ref.id}
                    className="admin-panel__referral-strip"
                    data-accent={accent}
                  >
                    <div className="admin-panel__referral-strip__main">
                      <div className="admin-panel__referral-strip__row">
                        <span className="admin-panel__referral-strip__title">
                          {displayLspId(ref.id)} — {ref.familyCode}
                        </span>
                        <span className="admin-panel__referral-strip__side" title={referrerPlace(ref)}>
                          {referrerPlace(ref)}
                        </span>
                      </div>
                      <div className="admin-panel__referral-strip__meta">
                        <span className={`admin-panel__referral-strip__pri ${priClass}`}>{ref.priority}</span>
                        <span className="admin-panel__referral-strip__sep">•</span>
                        <span className="admin-panel__referral-strip__status">
                          {statusDisplayLabel(ref.status)}
                        </span>
                        <span className="admin-panel__referral-strip__sep">•</span>
                        <span>{referrerRoute(ref)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="admin-panel__btn admin-panel__btn--primary admin-panel__referral-strip__cta"
                      onClick={() => setSelected(ref)}
                    >
                      Review
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="admin-panel__referrals-pager" aria-label="Referrals pagination">
              <div className="admin-panel__referrals-pager__left">
                <span className="admin-panel__referrals-pager__range">{rangeLabel}</span>
                <div className="admin-panel__referrals-pager__page-size">
                  <label className="admin-panel__label !mb-0 !inline" htmlFor="referrals-page-size">
                    Per page
                  </label>
                  <select
                    id="referrals-page-size"
                    className="admin-panel__input"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value) || 50);
                      setListPage(1);
                    }}
                  >
                    {REFERRALS_PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {totalPages > 1 ? (
                <div className="admin-panel__referrals-pager__controls">
                  <button
                    type="button"
                    className="admin-panel__btn admin-panel__btn--outline admin-panel__referrals-pager__btn"
                    disabled={listPageSafe <= 1}
                    onClick={() => setListPage(1)}
                  >
                    First
                  </button>
                  <button
                    type="button"
                    className="admin-panel__btn admin-panel__btn--outline admin-panel__referrals-pager__btn"
                    disabled={listPageSafe <= 1}
                    onClick={() => setListPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <span className="admin-panel__referrals-pager__count">
                    Page {listPageSafe} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="admin-panel__btn admin-panel__btn--outline admin-panel__referrals-pager__btn"
                    disabled={listPageSafe >= totalPages}
                    onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    className="admin-panel__btn admin-panel__btn--outline admin-panel__referrals-pager__btn"
                    disabled={listPageSafe >= totalPages}
                    onClick={() => setListPage(totalPages)}
                  >
                    Last
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <AdminPanelModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Referral: ${displayLspId(selected.id)}` : ''}
        wide
      >
        {selected && (
          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Family reference</p>
                <p className="font-bold" style={{ color: 'var(--luna-grey-800)' }}>
                  {selected.familyCode} · {selected.familySize} people
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Family / main contact
                </p>
                <p className="font-medium" style={{ color: 'var(--luna-grey-800)' }}>
                  {selected.contactName}
                </p>
                <p className="text-sm" style={{ color: 'var(--luna-grey-600)' }}>
                  {selected.contactEmail}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Referral source</p>
                {selected.referredBy ? (
                  <p className="text-sm font-semibold" style={{ color: 'var(--luna-grey-600)' }}>
                    Route: {selected.referredBy}
                  </p>
                ) : null}
                <p className="font-medium" style={{ color: 'var(--luna-grey-800)' }}>
                  {selected.referrerOrganisation || selected.referredBy || '—'}
                </p>
                <p className="text-xs font-semibold" style={{ color: 'var(--luna-grey-500)' }}>
                  We record schools, NHS and council routes, charities, faith groups, and family or neighbour
                  referrals — not individual clinicians’ names.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">SEN needs</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selected.senNeeds.map((n) => (
                    <span key={n} className="admin-panel__badge admin-panel__badge--pink">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Dietary requirements</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selected.dietaryReqs.map((d) => (
                    <span key={d} className="admin-panel__badge admin-panel__badge--blue">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              {selected.safefoods?.length ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Accepted safe foods</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selected.safefoods.map((f) => (
                      <span
                        key={f}
                        className="rounded-lg border border-amber-200 bg-white px-3 py-1 text-xs font-semibold"
                        style={{ color: 'var(--luna-grey-700)' }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {selected.urgencyReason ? (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Reason for urgency</p>
                  <p className="text-sm italic" style={{ color: 'var(--luna-grey-700)' }}>
                    &ldquo;{selected.urgencyReason}&rdquo;
                  </p>
                </div>
              ) : null}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Case notes</p>
                <p className="text-sm" style={{ color: 'var(--luna-grey-700)' }}>
                  {selected.notes}
                </p>
              </div>
            </div>

            <div className="admin-panel__card admin-panel__card--shadow admin-panel__card--clip">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Parcel packing</h3>
                <p className="text-sm text-gray-600">Add what went into this parcel and assign a driver.</p>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label className="admin-panel__label" htmlFor="driver-select">
                    Assigned driver (optional)
                  </label>
                  <select
                    id="driver-select"
                    className="admin-panel__input"
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                  >
                    <option value="">Not assigned yet</option>
                    {drivers.map((d) => (
                      <option key={d.email} value={d.email}>
                        {d.displayName ? `${d.displayName} — ${d.email}` : d.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="admin-panel__label mb-0">Packed items</p>
                    <button type="button" className="admin-panel__btn admin-panel__btn--outline rounded-lg px-4 py-2 text-xs font-bold uppercase" onClick={addPackLine}>
                      Add item
                    </button>
                  </div>
                  {packLines.length === 0 ? (
                    <p className="text-sm text-gray-500">No items added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {packLines.map((l) => (
                        <div key={l.id} className="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-6 sm:items-center">
                          <div className="sm:col-span-2">
                            <label className="admin-panel__label" htmlFor={`sku-${l.id}`}>SKU (optional)</label>
                            <input
                              id={`sku-${l.id}`}
                              className="admin-panel__input"
                              value={l.sku}
                              onChange={(e) => updatePackLine(l.id, { sku: e.target.value })}
                              placeholder="e.g. SOUP-TOM-400"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="admin-panel__label" htmlFor={`name-${l.id}`}>Item name</label>
                            <input
                              id={`name-${l.id}`}
                              className="admin-panel__input"
                              value={l.name}
                              onChange={(e) => updatePackLine(l.id, { name: e.target.value })}
                              placeholder="e.g. Tomato soup"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <label className="admin-panel__label" htmlFor={`qty-${l.id}`}>Qty</label>
                            <input
                              id={`qty-${l.id}`}
                              type="number"
                              min="1"
                              className="admin-panel__input"
                              value={l.qty}
                              onChange={(e) => updatePackLine(l.id, { qty: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-6 flex justify-end">
                            <button type="button" className="text-xs font-extrabold uppercase tracking-wide text-red-600 transition hover:opacity-75" onClick={() => removePackLine(l.id)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="admin-panel__label" htmlFor="pack-note">
                    Notes / substitutions
                  </label>
                  <textarea
                    id="pack-note"
                    className="admin-panel__input"
                    rows={4}
                    value={packNote}
                    onChange={(e) => setPackNote(e.target.value)}
                    style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                    placeholder="e.g. Could not supply GF pasta; substituted GF rice."
                  />
                </div>

                <button type="button" className="admin-panel__btn admin-panel__btn--primary w-full rounded-xl py-3" onClick={markPackedAndAssign}>
                  Save packing + assign driver
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" className="admin-panel__btn admin-panel__btn--primary flex-1" onClick={handleApproveDispatch}>
                Approve &amp; dispatch
              </button>
              <button type="button" className="admin-panel__btn admin-panel__btn--secondary flex-1" onClick={handleMarkReviewed}>
                Mark reviewed
              </button>
            </div>
            <button
              type="button"
              className="admin-panel__btn admin-panel__btn--outline w-full"
              onClick={handleRequestInfo}
            >
              Request more information (audit note)
            </button>
            <button type="button" className="admin-panel__btn admin-panel__btn--outline w-full" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        )}
      </AdminPanelModal>
    </div>
  );
}
