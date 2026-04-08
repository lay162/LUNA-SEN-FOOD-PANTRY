import React, { useMemo, useState, useRef } from 'react';
import { Image, Plus } from 'lucide-react';
import { useAdminOps } from '../../context/AdminOpsContext';
import AdminPanelModal from './components/AdminPanelModal';
import { readFileAsDataUrl } from './utils/receiptFile';

function badgeClass(cat) {
  if (cat === 'Gift' || cat?.toLowerCase().includes('donat')) return 'admin-panel__badge--green';
  return 'admin-panel__badge--blue';
}

export default function FundsAudit() {
  const { transactions, addTransaction, totalLiquidity, auditLog } = useAdminOps();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewReceipt, setViewReceipt] = useState(null);
  const [fileError, setFileError] = useState('');
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptName, setReceiptName] = useState('');
  const fileRef = useRef(null);

  const lastTx = transactions[0];

  const recentAudit = useMemo(
    () => auditLog.filter((a) => a.entityType === 'finance' || a.action.includes('transaction')).slice(0, 15),
    [auditLog]
  );

  const allOps = useMemo(() => auditLog.slice(0, 80), [auditLog]);

  const resetFile = () => {
    setReceiptPreview(null);
    setReceiptName('');
    setFileError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) {
      setReceiptPreview(null);
      setReceiptName('');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setReceiptPreview(dataUrl);
      setReceiptName(file.name);
    } catch (err) {
      setFileError(err.message || 'Invalid file');
      setReceiptPreview(null);
      setReceiptName('');
    }
  };

  return (
    <div className="admin-panel__fade-in admin-panel__page">
      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <div className="admin-panel__stock-card-head">
            <div className="admin-panel__stock-card-head__spacer" aria-hidden />
            <div className="min-w-0 text-center">
              <h2 className="admin-panel__referrals-title">Funds &amp; audit</h2>
              <p className="admin-panel__referrals-lede mt-2">
                Record donations and spending. Attach a photo of a receipt, bank app screenshot, or statement snippet so
                records stay verifiable.
              </p>
            </div>
            <div className="admin-panel__stock-card-head__actions">
              <button
                type="button"
                className="admin-panel__dash-quicklink admin-panel__dash-quicklink--gradient gap-2"
                onClick={() => setIsAddOpen(true)}
              >
                <Plus size={18} aria-hidden />
                Add transaction
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__grid-2">
        <div className="admin-panel__card admin-panel__card--shadow admin-panel__funds-snapshot-card admin-panel__funds-snapshot-card--liquidity">
          <div className="admin-panel__card-pad">
            <p className="admin-panel__label">Current liquidity</p>
            <p className="admin-panel__funds-snapshot-value">
              £{totalLiquidity.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="admin-panel__funds-snapshot-hint">
              Opening balance plus all logged income and expenses in this browser.
            </p>
          </div>
        </div>
        <div className="admin-panel__card admin-panel__card--accent-pink admin-panel__card--shadow admin-panel__funds-snapshot-card">
          <div className="admin-panel__card-pad">
            <p className="admin-panel__label">Last transaction</p>
            <p className="admin-panel__funds-snapshot-last-title">{lastTx ? lastTx.desc : '—'}</p>
            <p className="admin-panel__funds-snapshot-last-date">{lastTx ? lastTx.date : ''}</p>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title admin-panel__section-title--sm mb-1">Transaction log</h2>
          <p className="mb-5 text-sm text-gray-600">
            Donations (credit) and spending (debit). Proof thumbnails open full image.
          </p>
          <div className="admin-panel__table-wrap admin-panel__table-wrap--scroll">
            <table className="admin-panel__table admin-panel__table--funds">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Description</th>
                  <th scope="col">Category</th>
                  <th scope="col">Proof</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.desc}</td>
                    <td>
                      <span className={`admin-panel__badge ${badgeClass(row.cat)}`}>{row.cat}</span>
                    </td>
                    <td>
                      {row.receiptDataUrl ? (
                        <button
                          type="button"
                          onClick={() => setViewReceipt({ url: row.receiptDataUrl, name: row.receiptFileName || 'Proof' })}
                          className="admin-panel__funds-proof-btn"
                        >
                          <img src={row.receiptDataUrl} alt="" />
                          View
                        </button>
                      ) : (
                        <span style={{ color: 'var(--luna-grey-400)' }}>—</span>
                      )}
                    </td>
                    <td
                      className={
                        row.amt >= 0 ? 'admin-panel__funds-amt--credit' : 'admin-panel__funds-amt--debit'
                      }
                    >
                      {row.amt >= 0 ? '+' : ''}£{Math.abs(row.amt).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title admin-panel__section-title--sm mb-1">Finance-related audit events</h2>
          <p className="mb-5 text-sm text-gray-600">Immutable log (newest first) for accountability.</p>
          {recentAudit.length === 0 ? (
            <div className="admin-panel__panel-empty">No finance audit entries yet.</div>
          ) : (
            <ul className="admin-funds-audit__list">
              {recentAudit.map((a) => (
                <li key={a.id}>
                  <span className="admin-funds-audit__time">{new Date(a.at).toLocaleString('en-GB')}</span>
                  <span className="admin-funds-audit__sep">·</span>
                  <span className="admin-funds-audit__actor">{a.actor}</span>
                  <span className="admin-funds-audit__action"> — {a.action}</span>
                  {a.details ? <p className="admin-funds-audit__details">{a.details}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title admin-panel__section-title--sm mb-1">All operations (audit trail)</h2>
          <p className="mb-5 text-sm text-gray-600">Referral decisions, finance entries, and notes — newest first.</p>
          {allOps.length === 0 ? (
            <div className="admin-panel__panel-empty">No audit entries yet.</div>
          ) : (
            <ul className="admin-funds-audit__list admin-funds-audit__list--tall">
              {allOps.map((a) => (
                <li key={a.id}>
                  <span className="admin-funds-audit__time">{new Date(a.at).toLocaleString('en-GB')}</span>
                  <span className="admin-funds-audit__sep">·</span>
                  <span className="admin-funds-audit__actor">{a.actor}</span>
                  <span className="admin-funds-audit__action"> — {a.action}</span>
                  {a.entityType ? (
                    <span className="admin-funds-audit__entity">
                      ({a.entityType}
                      {a.entityId ? ` ${a.entityId}` : ''})
                    </span>
                  ) : null}
                  {a.details ? <p className="admin-funds-audit__details">{a.details}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AdminPanelModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          resetFile();
        }}
        title="Record transaction"
        wide
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setFileError('');
            const fd = new FormData(e.target);
            const amt = parseFloat(String(fd.get('amt')), 10);
            if (Number.isNaN(amt) || amt <= 0) {
              setFileError('Enter a valid amount.');
              return;
            }
            const type = fd.get('type');
            const signed = type === 'spend' ? -Math.abs(amt) : Math.abs(amt);
            let receiptDataUrl = receiptPreview;
            let receiptFileName = receiptName || null;
            const file = fileRef.current?.files?.[0];
            if (file && !receiptDataUrl) {
              try {
                receiptDataUrl = await readFileAsDataUrl(file);
                receiptFileName = file.name;
              } catch (err) {
                setFileError(err.message || 'Could not read image');
                return;
              }
            }
            addTransaction(
              {
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                desc: fd.get('desc'),
                amt: signed,
                type: type === 'spend' ? 'spend' : 'donation',
                cat: fd.get('cat'),
                receiptDataUrl: receiptDataUrl || undefined,
                receiptFileName: receiptFileName || undefined,
              },
              `Recorded ${type === 'spend' ? 'expense' : 'income'}: ${fd.get('desc')}`
            );
            setIsAddOpen(false);
            resetFile();
          }}
        >
          <div>
            <label className="admin-panel__funds-form-label" htmlFor="funds-desc">
              Description
            </label>
            <input
              id="funds-desc"
              name="desc"
              className="admin-panel__input"
              placeholder="e.g. Tesco stock shop / Anonymous donation"
              required
            />
          </div>
          <div>
            <label className="admin-panel__funds-form-label" htmlFor="funds-amt">
              Amount (£)
            </label>
            <input
              id="funds-amt"
              name="amt"
              type="number"
              step="0.01"
              min="0"
              className="admin-panel__input"
              required
            />
          </div>
          <div>
            <label className="admin-panel__funds-form-label" htmlFor="funds-type">
              Type
            </label>
            <select id="funds-type" name="type" className="admin-panel__input">
              <option value="donation">Income / donation (add funds)</option>
              <option value="spend">Pantry spend / expense (deduct funds)</option>
            </select>
          </div>
          <div>
            <label className="admin-panel__funds-form-label" htmlFor="funds-cat">
              Category
            </label>
            <input
              id="funds-cat"
              name="cat"
              className="admin-panel__input"
              placeholder="e.g. Inventory, Donation, Grant"
              required
            />
          </div>

          <div className="admin-panel__funds-upload">
            <label className="admin-panel__funds-form-label flex items-center gap-2 !mb-2" htmlFor="funds-receipt">
              <Image size={16} aria-hidden className="shrink-0" style={{ color: 'var(--luna-grey-500)' }} />
              Receipt or bank proof (recommended)
            </label>
            <p className="mb-3 text-xs" style={{ color: 'var(--luna-grey-600)', lineHeight: 1.45 }}>
              Upload a photo of a paper receipt, or a screenshot from your banking app / PDF statement. On phones you
              can use the camera. Keeps donations and spending transparent for audits.
            </p>
            <input
              id="funds-receipt"
              ref={fileRef}
              name="receipt"
              type="file"
              accept="image/*"
              capture="environment"
              className="admin-panel__funds-file-input"
              onChange={onFileChange}
            />
            {fileError ? (
              <p className="mt-2 text-sm font-semibold" style={{ color: '#dc2626' }}>
                {fileError}
              </p>
            ) : null}
            {receiptPreview ? (
              <div className="mt-3">
                <p className="text-xs font-bold" style={{ color: 'var(--luna-grey-700)' }}>
                  Preview
                </p>
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="mt-1 max-h-40 rounded-lg border object-contain"
                  style={{ borderColor: 'var(--luna-grey-200)' }}
                />
                <button type="button" className="admin-panel__funds-remove-file" onClick={resetFile}>
                  Remove image
                </button>
              </div>
            ) : null}
          </div>

          <button type="submit" className="admin-panel__btn admin-panel__btn--primary w-full">
            Save to log
          </button>
        </form>
      </AdminPanelModal>

      <AdminPanelModal
        isOpen={!!viewReceipt}
        onClose={() => setViewReceipt(null)}
        title={viewReceipt?.name || 'Receipt / proof'}
        wide
      >
        {viewReceipt ? (
          <img src={viewReceipt.url} alt="Receipt or bank proof" className="w-full rounded-lg border object-contain" />
        ) : null}
      </AdminPanelModal>
    </div>
  );
}
