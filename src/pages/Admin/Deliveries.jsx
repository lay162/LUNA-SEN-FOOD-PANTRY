import React, { useMemo, useRef, useState } from 'react';
import { Camera, MapPin, PackageCheck } from 'lucide-react';
import { useAdminOps } from '../../context/AdminOpsContext';
import AdminPanelModal from './components/AdminPanelModal';
import { readFileAsDataUrl } from './utils/receiptFile';
import { getAuthInstance, isFirebaseConfigured } from '../../firebase';

function displayLspId(id) {
  if (!id) return '—';
  return String(id).replace(/^REF/i, 'LSP');
}

function getParcelStatus(ref) {
  return ref?.parcel?.status || 'not-started';
}

function parcelStatusLabel(ps) {
  if (ps === 'loaded_in_van') return 'Loaded in van';
  if (ps === 'out_for_delivery') return 'Out for delivery';
  return String(ps || '').replaceAll('_', ' ') || '—';
}

function deliveryAccent(ref) {
  const ps = getParcelStatus(ref);
  if (ref.priority === 'urgent' || ref.status === 'urgent') return 'urgent';
  if (ps === 'out_for_delivery') return 'active';
  if (ps === 'loaded_in_van') return 'pending';
  return 'default';
}

function priorityMetaClass(priority) {
  if (priority === 'urgent') return 'admin-panel__referral-strip__pri--urgent';
  if (priority === 'high') return 'admin-panel__referral-strip__pri--high';
  if (priority === 'medium') return 'admin-panel__referral-strip__pri--medium';
  return 'admin-panel__referral-strip__pri--standard';
}

export default function Deliveries() {
  const { referrals, updateReferral, addAudit } = useAdminOps();
  const [selected, setSelected] = useState(null);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [loc, setLoc] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const deliveryQueue = useMemo(() => {
    const authEmail = isFirebaseConfigured() ? getAuthInstance()?.currentUser?.email : null;
    // Delivery-ready referrals: approved/active and loaded/out for delivery
    return referrals
      .filter((r) => ['active', 'pending', 'urgent'].includes(r.status))
      .filter((r) => ['loaded_in_van', 'out_for_delivery'].includes(getParcelStatus(r)))
      .filter((r) => {
        const assigned = r.parcel?.assignedDriverEmail;
        if (!assigned) return true;
        if (!authEmail) return true;
        return String(assigned).toLowerCase() === String(authEmail).toLowerCase();
      });
  }, [referrals]);

  const resetProof = () => {
    setErr('');
    setPhotoPreview(null);
    setPhotoName('');
    setLoc(null);
    setSaving(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const requestLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Location is not supported on this device.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            at: new Date().toISOString(),
          });
        },
        (e) => {
          reject(new Error(e.message || 'Location permission denied.'));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });

  const openProof = (ref) => {
    setSelected(ref);
    resetProof();
    setIsProofOpen(true);
    addAudit({
      action: 'delivery_proof_started',
      entityType: 'referral',
      entityId: ref.id,
      details: `Delivery proof started for ${ref.familyCode}`,
    });
  };

  const onFileChange = async (e) => {
    setErr('');
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      setPhotoName('');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoPreview(dataUrl);
      setPhotoName(file.name);
    } catch (ex) {
      setErr(ex.message || 'Could not read photo.');
    }
  };

  const markOutForDelivery = (ref) => {
    updateReferral(
      ref.id,
      { parcel: { ...(ref.parcel || {}), status: 'out_for_delivery', outForDeliveryAt: new Date().toISOString() } },
      {
        action: 'parcel_out_for_delivery',
        details: `${ref.familyCode} set to out for delivery`,
      }
    );
  };

  const openMaps = (ref) => {
    const addr = ref?.deliveryAddress || ref?.address || '';
    if (!addr) {
      window.alert('No delivery address is saved for this referral yet.');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    addAudit({
      action: 'delivery_opened_in_maps',
      entityType: 'referral',
      entityId: ref.id,
      details: `Opened maps for ${ref.familyCode}`,
    });
  };

  const submitDelivered = async () => {
    if (!selected) return;
    setErr('');
    setSaving(true);
    try {
      if (!photoPreview) throw new Error('Please take a front door photo.');
      const location = loc || (await requestLocation());
      setLoc(location);

      updateReferral(
        selected.id,
        {
          parcel: {
            ...(selected.parcel || {}),
            status: 'delivered',
            deliveredAt: new Date().toISOString(),
            proof: {
              photoDataUrl: photoPreview,
              photoFileName: photoName || 'front-door.jpg',
              location,
            },
          },
        },
        {
          action: 'parcel_delivered',
          details: `Delivered with photo + GPS (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)})`,
        }
      );

      addAudit({
        action: 'delivery_proof_uploaded',
        entityType: 'referral',
        entityId: selected.id,
        details: `Front door proof uploaded (${photoName || 'photo'}) · accuracy ${Math.round(location.accuracy)}m`,
      });

      setIsProofOpen(false);
      setSelected(null);
      resetProof();
    } catch (ex) {
      setErr(ex.message || 'Could not save proof.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-panel__fade-in admin-panel__page">
      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <div className="admin-panel__page-head">
            <div>
              <h2 className="admin-panel__referrals-title">Deliveries</h2>
              <p className="admin-panel__referrals-lede mt-2">
                Mobile-first delivery workflow. Mark parcels out for delivery, then upload front door proof with GPS.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow mt-6">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title admin-panel__section-title--sm">Coverage &amp; driver allocation</h2>
          <p className="mt-2 text-sm text-gray-600">
            Coordinators assign each parcel to a driver (and can note areas or rounds) when packing in{' '}
            <strong className="font-semibold text-gray-800">Received referrals</strong>. Only parcels marked{' '}
            <strong className="font-semibold text-gray-800">loaded in van</strong> or{' '}
            <strong className="font-semibold text-gray-800">out for delivery</strong> appear in the queue below. Drivers
            signed in see their own assigned drops where a driver email is set.
          </p>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow mt-6">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title admin-panel__section-title--sm mb-1">Delivery queue</h2>
          <p className="mb-5 text-sm text-gray-600">
            Today&apos;s drops ready-loaded or on the road. Use the row actions to start the route, open maps, or mark
            delivered with photo + GPS.
          </p>

          {deliveryQueue.length === 0 ? (
            <div className="admin-panel__panel-empty">No deliveries queued yet.</div>
          ) : (
            <div className="admin-panel__referrals-list">
              {deliveryQueue.map((r) => {
                const ps = getParcelStatus(r);
                const driver = String(r.parcel?.assignedDriverEmail || '').trim();
                const addr = String(r.deliveryAddress || r.address || '').trim();
                return (
                  <div key={r.id} className="admin-panel__referral-strip" data-accent={deliveryAccent(r)}>
                    <div className="admin-panel__referral-strip__main">
                      <div className="admin-panel__referral-strip__row">
                        <span className="admin-panel__referral-strip__title">
                          {displayLspId(r.id)} — {r.familyCode}
                        </span>
                        <span className="admin-panel__referral-strip__side" title={parcelStatusLabel(ps)}>
                          {parcelStatusLabel(ps)}
                        </span>
                      </div>
                      <div className="admin-panel__referral-strip__meta">
                        <span className={priorityMetaClass(r.priority)}>{r.priority || '—'}</span>
                        <span className="admin-panel__referral-strip__sep">•</span>
                        <span className="admin-panel__referral-strip__status">{r.contactName || '—'}</span>
                        <span className="admin-panel__referral-strip__sep">•</span>
                        <span title={driver || undefined}>{driver ? `Driver: ${driver}` : 'Driver: unassigned'}</span>
                      </div>
                      {addr ? (
                        <p className="admin-panel__referral-strip__note" title={addr}>
                          {addr}
                        </p>
                      ) : (
                        <p className="admin-panel__referral-strip__note">No delivery address on file — add in referrals.</p>
                      )}
                    </div>
                    <div className="admin-panel__referral-strip__actions">
                      {ps === 'loaded_in_van' ? (
                        <button
                          type="button"
                          className="admin-panel__btn admin-panel__btn--accent-blue admin-panel__referral-strip__btn"
                          onClick={() => markOutForDelivery(r)}
                        >
                          Start route
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="admin-panel__btn admin-panel__btn--outline admin-panel__referral-strip__btn"
                        onClick={() => openMaps(r)}
                      >
                        Open in maps
                      </button>
                      <button
                        type="button"
                        className="admin-panel__btn admin-panel__btn--primary admin-panel__referral-strip__cta"
                        onClick={() => openProof(r)}
                      >
                        <PackageCheck size={16} aria-hidden />
                        Mark delivered
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AdminPanelModal
        isOpen={isProofOpen}
        onClose={() => {
          setIsProofOpen(false);
          setSelected(null);
          resetProof();
        }}
        title={selected ? `Delivery proof: ${selected.familyCode}` : 'Delivery proof'}
        wide
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">Required</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li>Front door / parcel photo</li>
              <li>GPS location permission (requested on save)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4">
            <label className="admin-panel__label mb-2 flex items-center gap-2">
              <Camera size={16} aria-hidden />
              Front door photo
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-pink-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              onChange={onFileChange}
            />
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Front door proof preview"
                className="mt-3 max-h-64 w-full rounded-xl border object-contain"
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="admin-panel__btn admin-panel__btn--outline flex-1 rounded-xl px-6 py-3"
              onClick={async () => {
                setErr('');
                try {
                  const l = await requestLocation();
                  setLoc(l);
                  window.alert('Location captured.');
                } catch (ex) {
                  setErr(ex.message || 'Could not capture location.');
                }
              }}
            >
              <MapPin size={16} aria-hidden />
              Capture location now
            </button>
            <button
              type="button"
              className="admin-panel__btn admin-panel__btn--primary flex-1 rounded-xl px-6 py-3"
              disabled={saving}
              onClick={submitDelivered}
            >
              {saving ? 'Saving…' : 'Save proof & mark delivered'}
            </button>
          </div>

          {loc ? (
            <p className="text-xs font-semibold text-gray-500">
              Location: {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)} · accuracy {Math.round(loc.accuracy)}m
            </p>
          ) : null}
          {err ? <p className="text-sm font-semibold text-red-600">{err}</p> : null}
        </div>
      </AdminPanelModal>
    </div>
  );
}

