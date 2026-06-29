import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit3,
  X,
  Save,
  ChevronUp,
  ChevronDown,
  Boxes,
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import '../catalog/adminModule.css';
import './StockUpdates.css';

/* ─── Mock Data ─────────────────────────────────────────── */
const INITIAL_STOCK = [
  { id: 1, sku: 'SAT-DRP-001', name: 'Drip Irrigation Kit (1 Acre)', category: 'Irrigation Systems', subcategory: 'Drip Systems', supplier: 'AquaFlow Pvt Ltd', currentStock: 142, reorderLevel: 50, unit: 'Sets', costPrice: 3200, sellingPrice: 4500, status: 'In Stock', lastUpdated: '2026-06-28', trend: 'up', change: +18 },
  { id: 2, sku: 'SAT-SPR-004', name: 'Sprinkler Nozzle Set (10 pcs)', category: 'Irrigation Systems', subcategory: 'Sprinkler Systems', supplier: 'AquaFlow Pvt Ltd', currentStock: 8, reorderLevel: 30, unit: 'Sets', costPrice: 480, sellingPrice: 750, status: 'Low Stock', lastUpdated: '2026-06-28', trend: 'down', change: -22 },
  { id: 3, sku: 'SAT-HRV-002', name: 'Manual Reaper Binder', category: 'Harvesting Tools', subcategory: 'Manual Tools', supplier: 'Agri Implements Co.', currentStock: 0, reorderLevel: 20, unit: 'Pcs', costPrice: 1200, sellingPrice: 1850, status: 'Out of Stock', lastUpdated: '2026-06-27', trend: 'down', change: -100 },
  { id: 4, sku: 'SAT-FRT-007', name: 'NPK Fertilizer Spreader', category: 'Fertilizer Equipment', subcategory: 'Spreaders', supplier: 'GreenGrow Solutions', currentStock: 65, reorderLevel: 25, unit: 'Pcs', costPrice: 2800, sellingPrice: 4200, status: 'In Stock', lastUpdated: '2026-06-29', trend: 'up', change: +12 },
  { id: 5, sku: 'SAT-PMP-003', name: 'Submersible Water Pump (1HP)', category: 'Pumps & Motors', subcategory: 'Submersible Pumps', supplier: 'HydroTech India', currentStock: 34, reorderLevel: 15, unit: 'Pcs', costPrice: 5600, sellingPrice: 8200, status: 'In Stock', lastUpdated: '2026-06-28', trend: 'stable', change: 0 },
  { id: 6, sku: 'SAT-PES-012', name: 'Backpack Sprayer (16L)', category: 'Pesticide Equipment', subcategory: 'Sprayers', supplier: 'CropShield Ltd', currentStock: 12, reorderLevel: 25, unit: 'Pcs', costPrice: 1450, sellingPrice: 2100, status: 'Low Stock', lastUpdated: '2026-06-26', trend: 'down', change: -38 },
  { id: 7, sku: 'SAT-SOL-009', name: 'Solar Fence Controller', category: 'Solar Equipment', subcategory: 'Fence Systems', supplier: 'SolarFarm Tech', currentStock: 89, reorderLevel: 20, unit: 'Pcs', costPrice: 3800, sellingPrice: 5500, status: 'In Stock', lastUpdated: '2026-06-29', trend: 'up', change: +45 },
  { id: 8, sku: 'SAT-SED-005', name: 'Seed Drill Machine (5 Row)', category: 'Seeding Equipment', subcategory: 'Seed Drills', supplier: 'FarmTech Machines', currentStock: 6, reorderLevel: 10, unit: 'Units', costPrice: 18500, sellingPrice: 26000, status: 'Low Stock', lastUpdated: '2026-06-27', trend: 'down', change: -14 },
  { id: 9, sku: 'SAT-PVC-011', name: 'PVC Irrigation Pipe (50m)', category: 'Irrigation Systems', subcategory: 'Pipes & Fittings', supplier: 'PipeWorks India', currentStock: 210, reorderLevel: 80, unit: 'Rolls', costPrice: 620, sellingPrice: 950, status: 'In Stock', lastUpdated: '2026-06-29', trend: 'up', change: +30 },
  { id: 10, sku: 'SAT-WHL-008', name: 'Wheelbarrow (180L Capacity)', category: 'Farm Tools', subcategory: 'Material Handling', supplier: 'Agri Implements Co.', currentStock: 0, reorderLevel: 12, unit: 'Pcs', costPrice: 2200, sellingPrice: 3400, status: 'Out of Stock', lastUpdated: '2026-06-25', trend: 'down', change: -100 },
];

const CATEGORIES = ['All', 'Irrigation Systems', 'Harvesting Tools', 'Fertilizer Equipment', 'Pumps & Motors', 'Pesticide Equipment', 'Solar Equipment', 'Seeding Equipment', 'Farm Tools'];
const STATUSES = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

const statusMeta = {
  'In Stock':    { className: 'stock-badge--in',  icon: CheckCircle2 },
  'Low Stock':   { className: 'stock-badge--low', icon: AlertTriangle },
  'Out of Stock':{ className: 'stock-badge--out', icon: X },
};

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

/* ─── Stock Badge ─────────────────────────────────────── */
const StockBadge = ({ status }) => {
  const meta = statusMeta[status] || statusMeta['In Stock'];
  const Icon = meta.icon;
  return (
    <span className={`stock-badge ${meta.className}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

/* ─── Trend Indicator ────────────────────────────────── */
const TrendIndicator = ({ trend, change }) => {
  if (trend === 'up') return (
    <span className="stock-trend stock-trend--up">
      <ChevronUp size={13} /> +{change}%
    </span>
  );
  if (trend === 'down') return (
    <span className="stock-trend stock-trend--down">
      <ChevronDown size={13} /> {change}%
    </span>
  );
  return <span className="stock-trend stock-trend--stable">— Stable</span>;
};

/* ─── Adjust Modal ───────────────────────────────────── */
const AdjustModal = ({ item, onClose, onSave }) => {
  const [adjustType, setAdjustType] = useState('add');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const reasons = adjustType === 'add'
    ? ['Stock Received', 'Return from Customer', 'Transfer In', 'Correction - Surplus', 'Other']
    : ['Sale / Dispatch', 'Damaged / Spoiled', 'Transfer Out', 'Correction - Deficit', 'Other'];

  const newQty = adjustType === 'add'
    ? item.currentStock + Number(qty || 0)
    : Math.max(0, item.currentStock - Number(qty || 0));

  const handleSave = () => {
    if (!qty || Number(qty) <= 0) return;
    onSave({ ...item, currentStock: newQty });
  };

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div className="stock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stock-modal__header">
          <div>
            <p className="stock-modal__kicker">Stock Adjustment</p>
            <h2 className="stock-modal__title">{item.name}</h2>
            <p className="stock-modal__sku">SKU: {item.sku}</p>
          </div>
          <button className="stock-modal__close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="stock-modal__body">
          {/* Type Toggle */}
          <div className="stock-adj-toggle">
            <button
              className={`stock-adj-btn ${adjustType === 'add' ? 'stock-adj-btn--active-add' : ''}`}
              onClick={() => setAdjustType('add')}
            >
              <ArrowUpCircle size={16} /> Add Stock
            </button>
            <button
              className={`stock-adj-btn ${adjustType === 'remove' ? 'stock-adj-btn--active-remove' : ''}`}
              onClick={() => setAdjustType('remove')}
            >
              <ArrowDownCircle size={16} /> Remove Stock
            </button>
          </div>

          {/* Current → New */}
          <div className="stock-adj-preview">
            <div className="stock-adj-preview__item">
              <span>Current Stock</span>
              <strong>{item.currentStock} {item.unit}</strong>
            </div>
            <div className="stock-adj-preview__arrow">
              {adjustType === 'add' ? <TrendingUp size={20} className="adj-icon-add" /> : <TrendingDown size={20} className="adj-icon-remove" />}
            </div>
            <div className="stock-adj-preview__item">
              <span>New Stock</span>
              <strong className={adjustType === 'add' ? 'adj-new--add' : 'adj-new--remove'}>{newQty} {item.unit}</strong>
            </div>
          </div>

          <div className="stock-modal__fields">
            <div className="catalog-field">
              <label>Quantity ({item.unit})</label>
              <input
                type="number"
                min="1"
                placeholder="Enter quantity..."
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="catalog-field">
              <label>Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="">Select reason...</option>
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="catalog-field catalog-field--full">
              <label>Note (optional)</label>
              <textarea
                rows={2}
                placeholder="Add internal note about this adjustment..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ minHeight: 72 }}
              />
            </div>
          </div>
        </div>

        <div className="stock-modal__footer">
          <button className="catalog-btn" onClick={onClose}>Cancel</button>
          <button
            className={`catalog-btn ${adjustType === 'add' ? 'catalog-btn--primary' : 'catalog-btn--remove'}`}
            onClick={handleSave}
            disabled={!qty || Number(qty) <= 0}
          >
            <Save size={16} />
            Save Adjustment
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Add Entry Modal ─────────────────────────────────── */
const AddEntryModal = ({ onClose, onSave }) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [supplier, setSupplier] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  const handleSave = () => {
    if (!sku || !name || !category || !currentStock || !reorderLevel || !costPrice || !sellingPrice) {
      alert("Please fill in all required fields.");
      return;
    }
    
    onSave({
      sku: sku.toUpperCase().trim(),
      name: name.trim(),
      category,
      subcategory: subcategory.trim() || 'General',
      supplier: supplier.trim() || 'Unknown',
      currentStock: Number(currentStock),
      reorderLevel: Number(reorderLevel),
      unit,
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      trend: 'stable',
      change: 0
    });
  };

  const generateMockSku = () => {
    const catCode = category ? category.substring(0, 3).toUpperCase() : 'GEN';
    const randNum = Math.floor(100 + Math.random() * 900);
    setSku(`SAT-${catCode}-${randNum}`);
  };

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div className="stock-modal stock-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="stock-modal__header">
          <div>
            <p className="stock-modal__kicker">Inventory Management</p>
            <h2 className="stock-modal__title">Add New Stock Entry</h2>
            <p className="stock-modal__sku">Register a new product SKU into the ledger system</p>
          </div>
          <button className="stock-modal__close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="stock-modal__body">
          <div className="stock-modal__form-grid">
            
            {/* Left Column: Product Information */}
            <div className="stock-form-section">
              <h3 className="stock-form-section__title"><Boxes size={15} /> Product Information</h3>
              
              <div className="catalog-field">
                <label>Product Name <span className="field-required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Submersible Motor 2HP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="catalog-field">
                <label>SKU Code <span className="field-required">*</span></label>
                <div className="sku-input-wrap">
                  <input
                    type="text"
                    placeholder="e.g. SAT-MOT-054"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />
                  <button className="sku-gen-btn" onClick={generateMockSku} type="button" title="Generate SKU Code">
                    Generate
                  </button>
                </div>
              </div>

              <div className="stock-field-row">
                <div className="catalog-field">
                  <label>Category <span className="field-required">*</span></label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Select Category...</option>
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="catalog-field">
                  <label>Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. Pumps & Motors"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="catalog-field">
                <label>Supplier / Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. Kirloskar Ltd."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Inventory & Pricing */}
            <div className="stock-form-section">
              <h3 className="stock-form-section__title"><BarChart3 size={15} /> Inventory & Pricing</h3>

              <div className="stock-field-row">
                <div className="catalog-field">
                  <label>Initial Stock Qty <span className="field-required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    required
                  />
                </div>

                <div className="catalog-field">
                  <label>Reorder Level <span className="field-required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="stock-field-row">
                <div className="catalog-field">
                  <label>Stock Unit <span className="field-required">*</span></label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} required>
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Sets">Sets</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Units">Units</option>
                    <option value="Kgs">Kgs</option>
                    <option value="Litres">Litres</option>
                  </select>
                </div>

                <div className="catalog-field" style={{ opacity: 0, pointerEvents: 'none' }}>
                  <label>Placeholder</label>
                  <input type="text" disabled />
                </div>
              </div>

              <div className="stock-field-row">
                <div className="catalog-field">
                  <label>Cost Price (INR) <span className="field-required">*</span></label>
                  <div className="currency-input-wrap">
                    <span className="currency-prefix">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="catalog-field">
                  <label>Selling Price (INR) <span className="field-required">*</span></label>
                  <div className="currency-input-wrap">
                    <span className="currency-prefix">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        <div className="stock-modal__footer">
          <button className="catalog-btn" onClick={onClose}>Cancel</button>
          <button
            className="catalog-btn catalog-btn--primary"
            onClick={handleSave}
          >
            <Plus size={15} />
            Add Entry
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Screen ────────────────────────────────────── */
const StockUpdates = () => {
  const [items, setItems] = useState(INITIAL_STOCK);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  /* ── Metrics ── */
  const metrics = useMemo(() => ({
    total: items.length,
    inStock: items.filter(i => i.status === 'In Stock').length,
    lowStock: items.filter(i => i.status === 'Low Stock').length,
    outOfStock: items.filter(i => i.status === 'Out of Stock').length,
    totalValue: items.reduce((s, i) => s + i.currentStock * i.costPrice, 0),
  }), [items]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(i => {
      const matchSearch = !q || [i.sku, i.name, i.category, i.supplier].join(' ').toLowerCase().includes(q);
      const matchCat = categoryFilter === 'All' || i.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || i.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

  const handleSaveAdjust = (updated) => {
    const newStatus = updated.currentStock === 0
      ? 'Out of Stock'
      : updated.currentStock <= updated.reorderLevel
        ? 'Low Stock'
        : 'In Stock';
    setItems(prev => prev.map(i =>
      i.id === updated.id
        ? { ...updated, status: newStatus, lastUpdated: new Date().toISOString().slice(0, 10) }
        : i
    ));
    setAdjustingItem(null);
  };

  const handleRefresh = () => setLastRefreshed(new Date());

  return (
    <div className="stock-page">
      {/* ── Header ── */}
      <section className="catalog-header stock-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Inventory</span>
          <h1>Stock Updates</h1>
          <p>Monitor inventory levels, receive alerts for low-stock items, and make real-time adjustments across all product SKUs.</p>
        </div>
        <div className="stock-header-actions">
          <button className="catalog-btn stock-refresh-btn" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button className="catalog-btn" title="Export stock report">
            <Download size={15} />
            <span>Export</span>
          </button>
          <button className="catalog-btn catalog-btn--primary" onClick={() => setShowAddModal(true)} title="Add new stock entry">
            <Plus size={15} />
            <span>Add Entry</span>
          </button>
        </div>
      </section>

      {/* ── KPI Cards ── */}
      <div className="stock-metrics-grid">
        <div className="stock-metric-card stock-metric-card--blue">
          <div className="stock-metric-card__icon">
            <Boxes size={22} />
          </div>
          <div className="stock-metric-card__body">
            <span>Total SKUs</span>
            <strong>{metrics.total}</strong>
            <p>Products tracked</p>
          </div>
        </div>
        <div className="stock-metric-card stock-metric-card--green">
          <div className="stock-metric-card__icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="stock-metric-card__body">
            <span>In Stock</span>
            <strong>{metrics.inStock}</strong>
            <p>Adequate inventory</p>
          </div>
        </div>
        <div className="stock-metric-card stock-metric-card--amber">
          <div className="stock-metric-card__icon">
            <AlertTriangle size={22} />
          </div>
          <div className="stock-metric-card__body">
            <span>Low Stock</span>
            <strong>{metrics.lowStock}</strong>
            <p>Below reorder level</p>
          </div>
        </div>
        <div className="stock-metric-card stock-metric-card--red">
          <div className="stock-metric-card__icon">
            <Package size={22} />
          </div>
          <div className="stock-metric-card__body">
            <span>Out of Stock</span>
            <strong>{metrics.outOfStock}</strong>
            <p>Needs immediate action</p>
          </div>
        </div>
        <div className="stock-metric-card stock-metric-card--indigo">
          <div className="stock-metric-card__icon">
            <BarChart3 size={22} />
          </div>
          <div className="stock-metric-card__body">
            <span>Inventory Value</span>
            <strong>{formatINR(metrics.totalValue)}</strong>
            <p>At cost price</p>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <section className="catalog-card">
        <div className="catalog-card__header">
          <div>
            <h2>Stock Ledger</h2>
            <p className="catalog-card__subtitle">
              {filtered.length} of {items.length} products &nbsp;·&nbsp;
              Last refreshed: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="stock-legend">
            <span className="stock-badge stock-badge--in"><CheckCircle2 size={11} /> In Stock</span>
            <span className="stock-badge stock-badge--low"><AlertTriangle size={11} /> Low</span>
            <span className="stock-badge stock-badge--out"><X size={11} /> Out</span>
          </div>
        </div>

        {/* Filters */}
        <div className="catalog-filterbar">
          <div className="catalog-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search by SKU, product name, category, or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="stock-filters-right">
            <label className="catalog-filter">
              <Filter size={15} />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
            </label>
            <label className="catalog-filter">
              <ClipboardList size={15} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
              </select>
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="catalog-table-wrap">
          <table className="catalog-table stock-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Category</th>
                <th>Supplier</th>
                <th className="catalog-number-cell">Current Stock</th>
                <th className="catalog-number-cell">Reorder Level</th>
                <th>Status</th>
                <th>30-Day Trend</th>
                <th className="catalog-number-cell">Cost Price</th>
                <th className="catalog-number-cell">Selling Price</th>
                <th>Last Updated</th>
                <th className="catalog-center-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={item.status === 'Out of Stock' ? 'stock-row--alert' : item.status === 'Low Stock' ? 'stock-row--warning' : ''}>
                  <td>
                    <div className="catalog-table__title">{item.name}</div>
                    <div className="catalog-table__muted">{item.sku} &nbsp;·&nbsp; {item.unit}</div>
                  </td>
                  <td>
                    <div className="catalog-table__title">{item.category}</div>
                    <div className="catalog-table__muted">{item.subcategory}</div>
                  </td>
                  <td>{item.supplier}</td>
                  <td className="catalog-number-cell">
                    <span className={`stock-qty ${item.status === 'Out of Stock' ? 'stock-qty--zero' : item.status === 'Low Stock' ? 'stock-qty--low' : 'stock-qty--ok'}`}>
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="catalog-number-cell">{item.reorderLevel}</td>
                  <td><StockBadge status={item.status} /></td>
                  <td><TrendIndicator trend={item.trend} change={item.change} /></td>
                  <td className="catalog-number-cell">{formatINR(item.costPrice)}</td>
                  <td className="catalog-number-cell">{formatINR(item.sellingPrice)}</td>
                  <td>
                    <div className="catalog-table__muted">{item.lastUpdated}</div>
                  </td>
                  <td className="catalog-center-cell">
                    <button
                      className="catalog-btn catalog-btn--icon stock-adjust-btn"
                      title="Adjust stock"
                      onClick={() => setAdjustingItem(item)}
                    >
                      <Edit3 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="11">
                    <div className="orders-empty">No products match the current filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Adjust Modal ── */}
      {adjustingItem && (
        <AdjustModal
          item={adjustingItem}
          onClose={() => setAdjustingItem(null)}
          onSave={handleSaveAdjust}
        />
      )}

      {/* ── Add Entry Modal ── */}
      {showAddModal && (
        <AddEntryModal
          onClose={() => setShowAddModal(false)}
          onSave={(newEntry) => {
            setItems(prev => [
              ...prev,
              {
                id: prev.length ? Math.max(...prev.map(i => i.id)) + 1 : 1,
                ...newEntry,
                status: newEntry.currentStock === 0
                  ? 'Out of Stock'
                  : newEntry.currentStock <= newEntry.reorderLevel
                    ? 'Low Stock'
                    : 'In Stock',
                lastUpdated: new Date().toISOString().slice(0, 10)
              }
            ]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default StockUpdates;
