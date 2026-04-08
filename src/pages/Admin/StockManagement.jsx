import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STOCK_CATEGORY_DEFS } from '../../constants/pantryCatalog';
import { useAdminOps } from '../../context/AdminOpsContext';
import AdminPanelModal from './components/AdminPanelModal';

const MAX_STOCK_PHOTOS_PER_SLOT = 4;
const MAX_JPEG_DATA_URL_CHARS = 750_000;

function stockItemSearchHaystack(item) {
  const catDef = STOCK_CATEGORY_DEFS.find((c) => c.id === item.category);
  const catName = catDef?.name || item.category || '';
  return [
    item.name,
    item.sku,
    item.subCategory,
    item.location,
    item.batch,
    item.category,
    catName,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Matches typed fragments and compact runs, e.g. "soup-tom" → "Soup tomato". */
function itemMatchesStockSearch(item, rawQuery) {
  const q = String(rawQuery || '').trim().toLowerCase();
  if (!q) return true;
  const hay = stockItemSearchHaystack(item).toLowerCase();
  const hayCompact = hay.replace(/[\s\-_/]+/g, '');
  const qCompact = q.replace(/[\s\-_/]+/g, '');
  if (qCompact.length >= 2 && hayCompact.includes(qCompact)) return true;
  const tokens = q.split(/[\s\-_/]+/).filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((t) => hay.includes(t));
}

function emptyAddStockForm() {
  return {
    name: '',
    sku: '',
    category: 'tinned-food',
    subCategory: '',
    size: '',
    location: '',
    current: '0',
    minimum: '0',
    maximum: '0',
    unit: 'units',
    expiryDate: '',
    batch: '',
    supplier: '',
    notes: '',
    receiptPhotos: [],
    shoppingPhotos: [],
  };
}

/** Resize & JPEG-compress for localStorage-sized payloads (camera photos). */
function canvasToLeanJpegDataUrl(canvas) {
  let q = 0.82;
  let dataUrl = canvas.toDataURL('image/jpeg', q);
  while (dataUrl.length > MAX_JPEG_DATA_URL_CHARS && q > 0.48) {
    q -= 0.08;
    dataUrl = canvas.toDataURL('image/jpeg', q);
  }
  return dataUrl;
}

function imageSourceToJpegDataUrl(source, maxDim = 1280) {
  const w0 = source.naturalWidth ?? source.width;
  const h0 = source.naturalHeight ?? source.height;
  if (!w0 || !h0) throw new Error('bad image');
  const scale = Math.min(1, maxDim / Math.max(w0, h0));
  const w = Math.max(1, Math.floor(w0 * scale));
  const h = Math.max(1, Math.floor(h0 * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.drawImage(source, 0, 0, w, h);
  return canvasToLeanJpegDataUrl(canvas);
}

async function compressImageFileToJpegDataUrl(file) {
  try {
    const bitmap = await createImageBitmap(file);
    try {
      return imageSourceToJpegDataUrl(bitmap);
    } finally {
      bitmap.close?.();
    }
  } catch {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            resolve(imageSourceToJpegDataUrl(img));
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = () => reject(new Error('decode'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('read'));
      reader.readAsDataURL(file);
    });
  }
}

const StockManagement = () => {
  const { stockItems, setStockItems, addAudit } = useAdminOps();
  const receiptPhotoInputRef = useRef(null);
  const shoppingPhotoInputRef = useRef(null);
  const stockSearchWrapRef = useRef(null);
  const stockItemsSectionRef = useRef(null);
  const searchBlurTimerRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockSearchOpen, setStockSearchOpen] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(() => emptyAddStockForm());
  const [addErrors, setAddErrors] = useState({});

  const categories = useMemo(() => {
    const defs = [{ id: 'all', name: 'All Items', priority: 'high' }, ...STOCK_CATEGORY_DEFS];
    return defs.map((item) => ({
      ...item,
      count: item.id === 'all' ? stockItems.length : stockItems.filter((row) => row.category === item.id).length,
    }));
  }, [stockItems]);

  const getStatus = (item) => {
    if (item.current <= Math.max(2, Math.floor(item.minimum * 0.5))) return 'critical';
    if (item.current < item.minimum) return 'low';
    return 'good';
  };

  const getExpiryState = (expiryDate) => {
    if (!expiryDate) return 'none';
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'due-soon';
    return 'ok';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const updateQuantity = (id, value) => {
    const nextValue = Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
    setStockItems((current) =>
      current.map((item) => (item.id === id ? { ...item, current: nextValue } : item))
    );
  };

  const addStockNote = (item) => {
    const note = window.prompt(`Add an audit note for ${item.name}:`, '');
    if (!note) return;
    addAudit?.({
      action: 'stock_audit_note_added',
      entityType: 'stock_item',
      entityId: item.id,
      details: `Stock note (${item.sku}): ${note}`,
    });
    window.alert('Saved to audit log.');
  };

  const saveStockItem = (item) => {
    addAudit?.({
      action: 'stock_quantity_updated',
      entityType: 'stock_item',
      entityId: item.id,
      details: `Updated stock for ${item.name} (${item.sku}) → ${item.current} ${item.unit}`,
    });
    window.alert('Stock saved (and added to audit log).');
  };

  const closeAddModal = () => {
    setAddOpen(false);
    setAddForm(emptyAddStockForm());
    setAddErrors({});
  };

  const openAddModal = () => {
    setAddForm(emptyAddStockForm());
    setAddErrors({});
    setAddOpen(true);
  };

  const handleAddStockPhotoFiles = (kind, e) => {
    const input = e.target;
    const files = Array.from(input.files || []).filter((f) => f.type.startsWith('image/'));
    input.value = '';
    if (!files.length) return;
    const key = kind === 'receipt' ? 'receiptPhotos' : 'shoppingPhotos';

    setAddForm((prev) => {
      const cur = prev[key] || [];
      const room = Math.max(0, MAX_STOCK_PHOTOS_PER_SLOT - cur.length);
      if (room === 0) {
        window.alert(`You can attach up to ${MAX_STOCK_PHOTOS_PER_SLOT} photos per slot. Remove one to add another.`);
        return prev;
      }
      const take = files.slice(0, room);
      if (files.length > take.length) {
        window.alert(`Adding the first ${take.length} photo(s) only (max ${MAX_STOCK_PHOTOS_PER_SLOT} per slot).`);
      }
      void (async () => {
        try {
          const compressed = await Promise.all(take.map((f) => compressImageFileToJpegDataUrl(f)));
          setAddForm((p) => ({ ...p, [key]: [...(p[key] || []), ...compressed] }));
        } catch {
          window.alert(
            'Could not use that image. Try another photo, or on iPhone save as JPEG in Photos and pick again (some HEIC files may not load in the browser).'
          );
        }
      })();
      return prev;
    });
  };

  const removeAddStockPhoto = (kind, index) => {
    const key = kind === 'receipt' ? 'receiptPhotos' : 'shoppingPhotos';
    setAddForm((p) => ({ ...p, [key]: (p[key] || []).filter((_, i) => i !== index) }));
  };

  const updateAddField = (key, value) => {
    setAddForm((p) => ({ ...p, [key]: value }));
    if (addErrors[key]) setAddErrors((e) => ({ ...e, [key]: '' }));
  };

  const submitAddStock = (e) => {
    e.preventDefault();
    const name = String(addForm.name || '').trim();
    let sku = String(addForm.sku || '').trim().toUpperCase().replace(/\s+/g, '-');
    const err = {};
    if (!name) err.name = 'Item name is required';
    if (!sku) err.sku = 'SKU is required';
    if (sku && stockItems.some((i) => String(i.sku || '').toLowerCase() === sku.toLowerCase())) {
      err.sku = 'This SKU is already used';
    }
    if (Object.keys(err).length) {
      setAddErrors(err);
      return;
    }

    const nextId = Math.max(0, ...stockItems.map((s) => Number(s.id) || 0)) + 1;
    const batchDefault = `BCH-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;
    const receiptPhotos = Array.isArray(addForm.receiptPhotos) ? addForm.receiptPhotos.filter(Boolean) : [];
    const shoppingPhotos = Array.isArray(addForm.shoppingPhotos) ? addForm.shoppingPhotos.filter(Boolean) : [];
    const newItem = {
      id: nextId,
      sku,
      name,
      category: addForm.category,
      subCategory: String(addForm.subCategory || '').trim() || 'General',
      size: String(addForm.size || '').trim() || '—',
      current: Math.max(0, Number.parseInt(String(addForm.current), 10) || 0),
      minimum: Math.max(0, Number.parseInt(String(addForm.minimum), 10) || 0),
      maximum: Math.max(0, Number.parseInt(String(addForm.maximum), 10) || 0),
      unit: String(addForm.unit || '').trim() || 'units',
      expiryDate: String(addForm.expiryDate || '').trim() || null,
      batch: String(addForm.batch || '').trim() || batchDefault,
      location: String(addForm.location || '').trim() || 'TBC',
      supplier: String(addForm.supplier || '').trim() || '—',
      notes: String(addForm.notes || '').trim(),
      ...(receiptPhotos.length ? { receiptPhotos } : {}),
      ...(shoppingPhotos.length ? { shoppingPhotos } : {}),
    };

    setStockItems((prev) => [...prev, newItem]);
    const photoBit =
      receiptPhotos.length || shoppingPhotos.length
        ? ` · photos: receipt ×${receiptPhotos.length}, shopping ×${shoppingPhotos.length}`
        : '';
    addAudit?.({
      action: 'stock_item_created',
      entityType: 'stock_item',
      entityId: String(nextId),
      details: `Added ${name} (${sku}) · ${newItem.current} ${newItem.unit}${photoBit}`,
    });
    closeAddModal();
  };

  const filteredItems = stockItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = itemMatchesStockSearch(item, searchTerm);
    const expiryState = getExpiryState(item.expiryDate);
    const matchesExpiry =
      expiryFilter === 'all' ||
      (expiryFilter === 'due-soon' && expiryState === 'due-soon') ||
      (expiryFilter === 'expired' && expiryState === 'expired') ||
      (expiryFilter === 'no-expiry' && expiryState === 'none');
    return matchesCategory && matchesSearch && matchesExpiry;
  });

  const stockSearchSuggestions = useMemo(() => {
    const q = searchTerm.trim();
    if (q.length < 1) return [];
    return stockItems.filter((item) => itemMatchesStockSearch(item, q)).slice(0, 10);
  }, [stockItems, searchTerm]);

  useEffect(
    () => () => {
      if (searchBlurTimerRef.current) window.clearTimeout(searchBlurTimerRef.current);
    },
    []
  );

  const pickStockSuggestion = (item) => {
    if (searchBlurTimerRef.current) {
      window.clearTimeout(searchBlurTimerRef.current);
      searchBlurTimerRef.current = null;
    }
    setSearchTerm(item.name);
    setSelectedCategory('all');
    setExpiryFilter('all');
    setStockSearchOpen(false);
    window.requestAnimationFrame(() => {
      stockItemsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const criticalCount = stockItems.filter((item) => getStatus(item) === 'critical').length;
  const lowCount = stockItems.filter((item) => getStatus(item) === 'low').length;
  const goodCount = stockItems.filter((item) => getStatus(item) === 'good').length;
  const expiringSoonCount = stockItems.filter((item) => getExpiryState(item.expiryDate) === 'due-soon').length;

  const handleBulkStockUpdate = () => {
    const text = window.prompt(
      'Paste one line per item: SKU, then comma or tab, then new quantity.\nExample:\nTIN-001, 24\n\nLines must match an existing SKU in the list.'
    );
    if (!text?.trim()) return;
    const updates = new Map();
    for (const line of text.trim().split(/\n/)) {
      const parts = line.split(/[\t,]/).map((x) => x.trim()).filter(Boolean);
      const sku = parts[0];
      const qty = Number(parts[1]);
      if (!sku || !Number.isFinite(qty)) continue;
      updates.set(sku.toLowerCase(), Math.max(0, Math.floor(qty)));
    }
    if (!updates.size) {
      window.alert('No valid lines. Use: SKU,quantity per line.');
      return;
    }
    const lower = (s) => String(s || '').toLowerCase();
    let matched = 0;
    setStockItems((current) =>
      current.map((item) => {
        const q = updates.get(lower(item.sku));
        if (q === undefined) return item;
        matched += 1;
        return { ...item, current: q };
      })
    );
    addAudit?.({
      action: 'stock_bulk_quantity_update',
      entityType: 'stock',
      entityId: 'bulk',
      details: `Bulk update: ${matched} item(s) matched from ${updates.size} pasted SKU line(s)`,
    });
    window.alert(`Updated quantities for ${matched} item(s).`);
  };

  const handleStockReport = () => {
    const header = ['name', 'sku', 'category', 'subCategory', 'current', 'minimum', 'maximum', 'unit', 'expiryDate', 'location', 'status'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filteredItems.map((item) => ({
      ...item,
      status: getStatus(item),
    }));
    const csv = [header.join(','), ...rows.map((r) => header.map((h) => esc(r[h])).join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luna-stock-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addAudit?.({
      action: 'stock_report_exported',
      entityType: 'stock',
      entityId: 'list',
      details: `Exported ${rows.length} stock row(s) with current filters`,
    });
  };

  return (
    <div className="admin-panel__fade-in admin-panel__page">
      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <div className="admin-panel__stock-card-head">
            <div className="admin-panel__stock-card-head__spacer" aria-hidden />
            <div className="min-w-0 text-center">
              <h1 className="admin-panel__page-title">Stock management</h1>
              <p className="admin-panel__page-lede mt-2">
                Track levels, categories, and dates in one place. Filters and quick actions help you restock on time; key
                changes are reflected in your audit log.
              </p>
            </div>
            <div className="admin-panel__stock-card-head__actions">
              <button
                type="button"
                onClick={openAddModal}
                className="admin-panel__btn admin-panel__btn--primary shrink-0 rounded-lg px-5 py-2.5 text-[0.65rem] font-extrabold uppercase tracking-wide"
              >
                Add new item
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <div className="admin-panel__stat-grid admin-panel__stat-grid--compact">
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-red-600">{criticalCount}</p>
              <p className="admin-panel__stat-label">Critical</p>
            </div>
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-orange-600">{lowCount}</p>
              <p className="admin-panel__stat-label">Low</p>
            </div>
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-green-600">{goodCount}</p>
              <p className="admin-panel__stat-label">OK</p>
            </div>
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value" style={{ color: 'var(--luna-pink)' }}>
                {expiringSoonCount}
              </p>
              <p className="admin-panel__stat-label">Expiry 30d</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__stock-filters-grid">
        <div className="admin-panel__stock-filters-grid__col">
          <div className="admin-panel__card admin-panel__card--shadow min-w-0">
            <div className="admin-panel__card-pad admin-panel__card-pad--sm">
              <h2 className="admin-panel__section-title admin-panel__section-title--sm">Categories</h2>
              <div className="admin-panel__category-list admin-panel__category-list--compact">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    data-priority={category.priority || 'none'}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`admin-panel__category-btn ${
                      selectedCategory === category.id ? 'admin-panel__category-btn--active' : ''
                    }`}
                  >
                    <span className="admin-panel__category-btn-row">
                      <span className="admin-panel__category-btn-name">{category.name}</span>
                      <span className="admin-panel__category-btn-count">{`${category.count} items`}</span>
                    </span>
                    {category.priority ? (
                      <span
                        className={`admin-panel__category-btn-meta admin-panel__category-btn-meta--${category.priority}`}
                      >
                        {category.priority} priority
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-panel__card admin-panel__card--shadow min-w-0">
            <div className="admin-panel__card-pad admin-panel__card-pad--sm flex flex-col">
              <h2 className="admin-panel__section-title admin-panel__section-title--sm">Expiry filter</h2>
              <div className="mt-4">
                <label className="admin-panel__label" htmlFor="stock-expiry">
                  Show items by expiry
                </label>
                <select
                  id="stock-expiry"
                  className="admin-panel__input"
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="due-soon">Due in 30 days</option>
                  <option value="expired">Expired</option>
                  <option value="no-expiry">No expiry date</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-panel__stock-filters-grid__col">
          <div className="admin-panel__card admin-panel__card--shadow min-w-0">
            <div className="admin-panel__card-pad admin-panel__card-pad--sm flex flex-col">
              <h2 className="admin-panel__section-title admin-panel__section-title--sm">Search items</h2>
              <div className="mt-4">
                <label className="admin-panel__label" htmlFor="stock-search">
                  Filter by name, SKU, or fragments
                </label>
                <div className="admin-panel__stock-search-wrap" ref={stockSearchWrapRef}>
                  <input
                    id="stock-search"
                    type="text"
                    className="admin-panel__input"
                    placeholder="Try name, SKU, or fragments (e.g. soup-tom → Soup tomato)"
                    value={searchTerm}
                    role="combobox"
                    aria-expanded={stockSearchOpen && stockSearchSuggestions.length > 0}
                    aria-controls="stock-search-suggestions"
                    aria-autocomplete="list"
                    autoComplete="off"
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setStockSearchOpen(true);
                    }}
                    onFocus={() => {
                      if (searchTerm.trim().length >= 1) setStockSearchOpen(true);
                    }}
                    onBlur={() => {
                      searchBlurTimerRef.current = window.setTimeout(() => setStockSearchOpen(false), 150);
                    }}
                  />
                  {stockSearchOpen && stockSearchSuggestions.length > 0 ? (
                    <ul
                      id="stock-search-suggestions"
                      className="admin-panel__stock-search-suggestions"
                      role="listbox"
                    >
                      {stockSearchSuggestions.map((item) => (
                        <li key={item.id} role="presentation">
                          <button
                            type="button"
                            role="option"
                            className="admin-panel__stock-search-suggestion"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pickStockSuggestion(item)}
                          >
                            <span className="admin-panel__stock-search-suggestion__name">{item.name}</span>
                            <span className="admin-panel__stock-search-suggestion__meta">
                              {item.sku ? `${item.sku} · ` : ''}
                              {STOCK_CATEGORY_DEFS.find((c) => c.id === item.category)?.name || item.category}
                              {item.current != null ? ` · ${item.current} ${item.unit || 'units'}` : ''}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Suggestions as you type; pick one to jump to the table with category and expiry filters reset to All.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-panel__card admin-panel__card--shadow min-w-0">
            <div className="admin-panel__card-pad admin-panel__card-pad--sm flex flex-col">
              <h2 className="admin-panel__section-title admin-panel__section-title--sm">Actions</h2>
              <div className="admin-panel__action-stack mt-4">
                <button
                  type="button"
                  onClick={openAddModal}
                  className="admin-panel__dash-quicklink admin-panel__dash-quicklink--pink"
                >
                  Add new item
                </button>
                <button
                  type="button"
                  onClick={handleBulkStockUpdate}
                  className="admin-panel__dash-quicklink admin-panel__dash-quicklink--gradient"
                >
                  Bulk stock update
                </button>
                <button
                  type="button"
                  onClick={handleStockReport}
                  className="admin-panel__dash-quicklink admin-panel__dash-quicklink--blue"
                >
                  Generate stock report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow" ref={stockItemsSectionRef}>
        <div className="admin-panel__card-pad">
          <h2 className="admin-panel__section-title mb-1">
            Stock items
            {selectedCategory !== 'all' && (
              <span className="ml-2 text-sm font-semibold normal-case text-gray-500">
                — {categories.find((c) => c.id === selectedCategory)?.name}
              </span>
            )}
          </h2>
          <p className="mb-6 text-sm text-gray-600">Adjust quantities and review levels. Items match your filters above.</p>

          <div className="admin-panel__table-wrap">
            <table className="admin-panel__table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>SKU</th>
                  <th style={{ width: 140 }}>Current</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-gray-900">{item.name}</div>
                        <div className="mt-0.5 truncate text-xs text-gray-500">
                          {[item.subCategory, item.size, item.location].filter(Boolean).join(' · ') || '—'}
                        </div>
                        {item.receiptPhotos?.length || item.shoppingPhotos?.length ? (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {(() => {
                              const thumbs = [
                                ...(item.receiptPhotos || []).map((src, i) => ({
                                  src,
                                  key: `r-${item.id}-${i}`,
                                  title: 'Receipt photo — open full size',
                                })),
                                ...(item.shoppingPhotos || []).map((src, i) => ({
                                  src,
                                  key: `s-${item.id}-${i}`,
                                  title: 'Shopping photo — open full size',
                                })),
                              ];
                              const show = thumbs.slice(0, 4);
                              const more = thumbs.length - 4;
                              return (
                                <>
                                  {show.map((t) => (
                                    <a
                                      key={t.key}
                                      href={t.src}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block shrink-0 overflow-hidden rounded-lg border border-gray-200"
                                      title={t.title}
                                    >
                                      <img src={t.src} alt="" className="h-9 w-9 object-cover" />
                                    </a>
                                  ))}
                                  {more > 0 ? (
                                    <span className="text-[10px] font-bold text-gray-500">+{more} more</span>
                                  ) : null}
                                </>
                              );
                            })()}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="text-xs font-semibold text-gray-700">{item.sku}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          className="admin-panel__input admin-panel__input--compact"
                          value={item.current}
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                        />
                        <span className="text-xs font-semibold text-gray-500">{item.unit}</span>
                      </div>
                    </td>
                    <td className="text-sm font-semibold text-gray-800">
                      {item.minimum} {item.unit}
                    </td>
                    <td className="text-sm font-semibold text-gray-800">
                      {item.maximum} {item.unit}
                    </td>
                    <td className="text-sm font-semibold text-gray-800">
                      {item.expiryDate || 'N/A'}
                      <div className="mt-0.5 text-xs text-gray-500">
                        {getExpiryState(item.expiryDate) === 'due-soon'
                          ? 'Due soon'
                          : getExpiryState(item.expiryDate) === 'expired'
                            ? 'Expired'
                            : getExpiryState(item.expiryDate) === 'none'
                              ? 'Non-food'
                              : 'In date'}
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-extrabold uppercase ${getStatusColor(getStatus(item))}`}>
                        {getStatus(item)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-panel__table-row-actions">
                        <button
                          type="button"
                          className="admin-panel__btn admin-panel__btn--table-secondary"
                          onClick={() => addStockNote(item)}
                        >
                          Audit note
                        </button>
                        <button
                          type="button"
                          className="admin-panel__btn admin-panel__btn--table-primary"
                          onClick={() => saveStockItem(item)}
                        >
                          Save
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-gray-500">
              No items match your filters.
            </div>
          )}
        </div>
      </div>

      <AdminPanelModal isOpen={addOpen} onClose={closeAddModal} title="Add stock item" wide>
        <form onSubmit={submitAddStock} className="space-y-5">
          <p className="text-sm text-gray-600">
            Same fields as your inventory list: appears in the table with quantity, min/max, expiry and status.
          </p>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
            <p className="text-xs font-extrabold uppercase tracking-wide text-gray-500">Receipt &amp; shopping photos</p>
            <p className="mt-1 text-sm text-gray-600">
              On a phone, buttons open the <span className="font-semibold">camera</span> or gallery. Snap a till receipt, your trolley, shelf
              labels, or packed bags — useful for audits and faster stock-in after a shop run.
            </p>
            <input
              ref={receiptPhotoInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              onChange={(e) => handleAddStockPhotoFiles('receipt', e)}
            />
            <input
              ref={shoppingPhotoInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              onChange={(e) => handleAddStockPhotoFiles('shopping', e)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="admin-panel__btn admin-panel__btn--secondary rounded-xl px-4 py-2.5 text-[0.65rem] font-extrabold uppercase tracking-wide"
                onClick={() => receiptPhotoInputRef.current?.click()}
              >
                Receipt camera / upload
              </button>
              <button
                type="button"
                className="admin-panel__btn admin-panel__btn--outline rounded-xl px-4 py-2.5 text-[0.65rem] font-extrabold uppercase tracking-wide"
                onClick={() => shoppingPhotoInputRef.current?.click()}
              >
                Shopping / items photo
              </button>
            </div>
            {(addForm.receiptPhotos?.length || 0) + (addForm.shoppingPhotos?.length || 0) > 0 ? (
              <div className="mt-4 space-y-3">
                {addForm.receiptPhotos?.length ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Receipt ({addForm.receiptPhotos.length})</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {addForm.receiptPhotos.map((src, i) => (
                        <div key={`rp-${i}-${src.slice(0, 24)}`} className="relative">
                          <img src={src} alt="" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
                          <button
                            type="button"
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow"
                            onClick={() => removeAddStockPhoto('receipt', i)}
                            aria-label={`Remove receipt photo ${i + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {addForm.shoppingPhotos?.length ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                      Shopping ({addForm.shoppingPhotos.length})
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {addForm.shoppingPhotos.map((src, i) => (
                        <div key={`sp-${i}-${src.slice(0, 24)}`} className="relative">
                          <img src={src} alt="" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
                          <button
                            type="button"
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow"
                            onClick={() => removeAddStockPhoto('shopping', i)}
                            aria-label={`Remove shopping photo ${i + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="admin-panel__label" htmlFor="add-stock-name">
                Item name <span className="text-red-500">*</span>
              </label>
              <input
                id="add-stock-name"
                className="admin-panel__input"
                value={addForm.name}
                onChange={(e) => updateAddField('name', e.target.value)}
                placeholder="e.g. Tomato Soup"
                autoComplete="off"
              />
              {addErrors.name ? <p className="mt-1 text-xs font-semibold text-red-600">{addErrors.name}</p> : null}
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-sku">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                id="add-stock-sku"
                className="admin-panel__input"
                value={addForm.sku}
                onChange={(e) => updateAddField('sku', e.target.value)}
                placeholder="e.g. SOUP-TOM-400"
                autoComplete="off"
              />
              {addErrors.sku ? <p className="mt-1 text-xs font-semibold text-red-600">{addErrors.sku}</p> : null}
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-category">
                Category
              </label>
              <select
                id="add-stock-category"
                className="admin-panel__input"
                value={addForm.category}
                onChange={(e) => updateAddField('category', e.target.value)}
              >
                {STOCK_CATEGORY_DEFS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-sub">
                Sub-category
              </label>
              <input
                id="add-stock-sub"
                className="admin-panel__input"
                value={addForm.subCategory}
                onChange={(e) => updateAddField('subCategory', e.target.value)}
                placeholder="e.g. Soups"
              />
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-size">
                Size / pack
              </label>
              <input
                id="add-stock-size"
                className="admin-panel__input"
                value={addForm.size}
                onChange={(e) => updateAddField('size', e.target.value)}
                placeholder="e.g. 400g"
              />
            </div>

            <div className="md:col-span-2">
              <label className="admin-panel__label" htmlFor="add-stock-loc">
                Location
              </label>
              <input
                id="add-stock-loc"
                className="admin-panel__input"
                value={addForm.location}
                onChange={(e) => updateAddField('location', e.target.value)}
                placeholder="e.g. Aisle A - Bay 1"
              />
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-current">
                Current quantity
              </label>
              <input
                id="add-stock-current"
                type="number"
                min="0"
                className="admin-panel__input"
                value={addForm.current}
                onChange={(e) => updateAddField('current', e.target.value)}
              />
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-unit">
                Unit
              </label>
              <input
                id="add-stock-unit"
                className="admin-panel__input"
                value={addForm.unit}
                onChange={(e) => updateAddField('unit', e.target.value)}
                placeholder="e.g. tins, packs, cartons"
              />
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-min">
                Minimum
              </label>
              <input
                id="add-stock-min"
                type="number"
                min="0"
                className="admin-panel__input"
                value={addForm.minimum}
                onChange={(e) => updateAddField('minimum', e.target.value)}
              />
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-max">
                Maximum
              </label>
              <input
                id="add-stock-max"
                type="number"
                min="0"
                className="admin-panel__input"
                value={addForm.maximum}
                onChange={(e) => updateAddField('maximum', e.target.value)}
              />
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-expiry">
                Expiry date
              </label>
              <input
                id="add-stock-expiry"
                type="date"
                className="admin-panel__input"
                value={addForm.expiryDate}
                onChange={(e) => updateAddField('expiryDate', e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty for non-dated items (e.g. nappies).</p>
            </div>

            <div>
              <label className="admin-panel__label" htmlFor="add-stock-batch">
                Batch
              </label>
              <input
                id="add-stock-batch"
                className="admin-panel__input"
                value={addForm.batch}
                onChange={(e) => updateAddField('batch', e.target.value)}
                placeholder="Auto if left blank"
              />
            </div>

            <div className="md:col-span-2">
              <label className="admin-panel__label" htmlFor="add-stock-supplier">
                Supplier
              </label>
              <input
                id="add-stock-supplier"
                className="admin-panel__input"
                value={addForm.supplier}
                onChange={(e) => updateAddField('supplier', e.target.value)}
                placeholder="e.g. FareShare"
              />
            </div>

            <div className="md:col-span-2">
              <label className="admin-panel__label" htmlFor="add-stock-notes">
                Notes
              </label>
              <textarea
                id="add-stock-notes"
                className="admin-panel__input min-h-[4rem]"
                value={addForm.notes}
                onChange={(e) => updateAddField('notes', e.target.value)}
                placeholder="Optional — allergen info, handling, etc."
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-5">
            <button type="submit" className="admin-panel__btn admin-panel__btn--primary rounded-xl px-6 py-3 text-xs font-extrabold uppercase">
              Add to inventory
            </button>
            <button
              type="button"
              className="admin-panel__btn admin-panel__btn--outline rounded-xl px-6 py-3 text-xs font-extrabold uppercase"
              onClick={closeAddModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminPanelModal>
    </div>
  );
};

export default StockManagement;