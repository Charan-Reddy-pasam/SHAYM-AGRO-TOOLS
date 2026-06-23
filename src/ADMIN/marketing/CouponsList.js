import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Edit,
  Filter,
  Percent,
  Plus,
  Search,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import '../catalog/adminModule.css';
import { fetchCoupons as getCoupons, updateCoupon, deleteCoupon as apiDeleteCoupon } from './api';

const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDiscount = (coupon) => {
  if (coupon.type === 'Percentage') return `${coupon.discount}%`;
  if (coupon.type === 'Shipping') return 'Free Delivery';
  return formatCurrency(coupon.discount);
};

const CouponStatusBadge = ({ status }) => (
  <span className={`coupon-status coupon-status--${status.toLowerCase()}`}>
    {status === 'Active' ? <CheckCircle2 size={14} /> : <Tag size={14} />}
    {status}
  </span>
);

const CouponEditModal = ({ coupon, onClose, onSave }) => {
  const [formData, setFormData] = useState(coupon);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="coupon-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-coupon-title">
      <div className="coupon-modal">
        <div className="coupon-modal__header">
          <div>
            <span className="catalog-kicker">Campaign Editor</span>
            <h2 id="edit-coupon-title">Edit Coupon: {coupon.code}</h2>
            <p>Update discount rules, usage limits, campaign dates, and status.</p>
          </div>
          <button className="catalog-btn catalog-btn--icon close-modal-btn" type="button" onClick={onClose} title="Close edit coupon popup">
            <X size={16} />
          </button>
        </div>
        <div className="coupon-modal__summary">
          <div>
            <span>Current Offer</span>
            <strong>{formatDiscount(formData)}</strong>
          </div>
          <div>
            <span>Minimum Cart</span>
            <strong>{formatCurrency(formData.minSpend)}</strong>
          </div>
          <div>
            <span>Validity</span>
            <strong>{formData.startDate} to {formData.endDate}</strong>
          </div>
          <div>
            <span>Status</span>
            <CouponStatusBadge status={formData.status} />
          </div>
        </div>

        <form className="catalog-form coupon-edit-form" onSubmit={handleSubmit}>
          {/* General Information */}
          <div className="coupon-modal__form-section">
            <h3 className="coupon-modal__section-title">General Information</h3>
            <div className="coupon-modal__grid-2">
              <div className="catalog-field">
                <label htmlFor="edit-code">Coupon Code</label>
                <input id="edit-code" name="code" value={formData.code} onChange={handleChange} required />
              </div>

              <div className="catalog-field">
                <label htmlFor="edit-type">Discount Type</label>
                <select id="edit-type" name="type" value={formData.type} onChange={handleChange}>
                  <option value="Percentage">Percentage</option>
                  <option value="Flat Amount">Flat Amount</option>
                  <option value="Shipping">Free Delivery</option>
                </select>
              </div>

              <div className="catalog-field catalog-field--full">
                <label htmlFor="edit-description">Description</label>
                <textarea id="edit-description" name="description" rows={2} value={formData.description} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Discount Rules */}
          <div className="coupon-modal__form-section">
            <h3 className="coupon-modal__section-title">Discount Rules & Limits</h3>
            <div className="coupon-modal__grid-2">
              <div className="catalog-field">
                <label htmlFor="edit-discount">Discount Value</label>
                <input id="edit-discount" name="discount" value={formData.discount} onChange={handleChange} required />
              </div>
              <div className="catalog-field">
                <label htmlFor="edit-maxDiscount">Maximum Discount Cap</label>
                <input id="edit-maxDiscount" name="maxDiscount" type="number" value={formData.maxDiscount} onChange={handleChange} />
              </div>

              <div className="catalog-field">
                <label htmlFor="edit-minSpend">Minimum Cart Value</label>
                <input id="edit-minSpend" name="minSpend" type="number" value={formData.minSpend} onChange={handleChange} />
              </div>

              <div className="catalog-field">
                <label htmlFor="edit-usageLimit">Usage Limit</label>
                <input id="edit-usageLimit" name="usageLimit" value={formData.usageLimit} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Schedule & Status */}
          <div className="coupon-modal__form-section">
            <h3 className="coupon-modal__section-title">Schedule & Status</h3>
            <div className="coupon-modal__grid-3">
              <div className="catalog-field">
                <label htmlFor="edit-startDate">Start Date</label>
                <input id="edit-startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
              </div>

              <div className="catalog-field">
                <label htmlFor="edit-endDate">End Date</label>
                <input id="edit-endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
              </div>

              <div className="catalog-field">
                <label htmlFor="edit-status">Campaign Status</label>
                <select id="edit-status" name="status" value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          <div className="coupon-modal__actions">
            <button className="catalog-btn cancel-btn" type="button" onClick={onClose}>Cancel</button>
            <button className="catalog-btn catalog-btn--primary save-btn" type="submit">
              <CheckCircle2 size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CouponsList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Fetch coupons on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCoupons();
        setCoupons(data);
        setError(null);
      } catch (err) {
        setError('Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCoupons = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const matchesSearch = [coupon.code, coupon.description, coupon.type]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All' || coupon.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    return coupons.reduce(
      (acc, coupon) => ({
        active: acc.active + (coupon.status === 'Active' ? 1 : 0),
        usage: acc.usage + Number(coupon.usedCount || 0),
        campaigns: acc.campaigns + 1
      }),
      { active: 0, usage: 0, campaigns: 0 }
    );
  }, [coupons]);

  const toggleCouponStatus = async (id, code) => {
    const target = coupons.find((c) => c.id === id);
    if (!target || target.status === 'Expired') return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateCoupon(id, { ...target, status: newStatus });
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      setError(null);
    } catch (err) {
      setError(`Failed to update status for ${code}: ${err.message || err}`);
    }
  };

  const deleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await apiDeleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setError(null);
    } catch (err) {
      setError(`Failed to delete coupon ${code}: ${err.message || err}`);
    }
  };

  const saveEditedCoupon = async (updatedCoupon) => {
    try {
      await updateCoupon(updatedCoupon.id, updatedCoupon);
      setCoupons((prev) =>
        prev.map((c) => (c.id === updatedCoupon.id ? updatedCoupon : c))
      );
      setEditingCoupon(null);
      setError(null);
    } catch (err) {
      setError(`Failed to save coupon: ${err.message || err}`);
    }
  };

  if (loading) {
    return <div className="catalog-loader">Loading coupons...</div>;
  }

  return (
    <div className="coupons-page">
      {error && <div className="catalog-alert catalog-alert--error">{error}</div>}
      <section className="catalog-header coupons-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Marketing</span>
          <h1>Promotions & Coupons</h1>
          <p>Manage campaign vouchers, cart rules, seasonal discounts, and grower purchase incentives.</p>
        </div>
        <div className="coupons-metrics">
          <div>
            <span>Total Campaigns</span>
            <strong>{summary.campaigns}</strong>
          </div>
          <div>
            <span>Active Coupons</span>
            <strong>{summary.active}</strong>
          </div>
          <div>
            <span>Total Uses</span>
            <strong>{summary.usage}</strong>
          </div>
        </div>
      </section>

      <section className="catalog-card">
        <div className="catalog-card__header">
          <div>
            <h2>Coupon Campaigns</h2>
            <p className="catalog-card__subtitle">{filteredCoupons.length} coupons match the current view.</p>
          </div>
          <Link className="catalog-btn catalog-btn--primary" to="/admin/marketing/coupon">
            <Plus size={16} />
            Create Coupon
          </Link>
        </div>

        <div className="catalog-filterbar coupons-filterbar">
          <div className="catalog-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search coupon code, campaign, or discount type"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <label className="catalog-filter">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
            </select>
          </label>
        </div>

        <div className="coupons-grid">
          {filteredCoupons.map((coupon) => (
            <article className={`coupon-card coupon-card--${coupon.status.toLowerCase()}`} key={coupon.code}>
              <div className="coupon-card__watermark"><Tag size={48} /></div>

              <div className="coupon-card__top">
                <div>
                  <span className="coupon-code">{coupon.code}</span>
                  <p>{coupon.description}</p>
                </div>
                <CouponStatusBadge status={coupon.status} />
              </div>

              <div className="coupon-value-row">
                <div>
                  <span>Discount</span>
                  <strong>{formatDiscount(coupon)}</strong>
                </div>
                <div>
                  <span>Minimum Cart</span>
                  <strong>{formatCurrency(coupon.minSpend)}</strong>
                </div>
                <div>
                  <span>Used</span>
                  <strong>{coupon.usedCount}</strong>
                </div>
              </div>

              <div className="coupon-meta-row">
                <span><Calendar size={14} /> {coupon.startDate} to {coupon.endDate}</span>
                <span><Percent size={14} /> Cap {formatCurrency(coupon.maxDiscount)}</span>
              </div>

              <div className="coupon-card__footer">
                <button
                  className="catalog-btn"
                  type="button"
                  onClick={() => toggleCouponStatus(coupon.id, coupon.code)}
                  disabled={coupon.status === 'Expired'}
                >
                  {coupon.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
                <div className="catalog-inline-actions">
                  <button className="catalog-btn catalog-btn--icon" type="button" onClick={() => setEditingCoupon(coupon)} title="Edit coupon">
                    <Edit size={16} />
                  </button>
                  <button className="catalog-btn catalog-btn--icon catalog-btn--danger" type="button" onClick={() => deleteCoupon(coupon.id, coupon.code)} title="Delete coupon">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!filteredCoupons.length && (
            <div className="catalog-empty-state coupons-empty">
              <Tag size={28} />
              <h3>No coupons found</h3>
              <p>Try adjusting your search or create a new coupon campaign for the current season.</p>
              <Link className="catalog-btn catalog-btn--primary" to="/admin/marketing/coupon">
                <Plus size={16} />
                Create Coupon
              </Link>
            </div>
          )}
        </div>
      </section>

      {editingCoupon && (
        <CouponEditModal
          coupon={editingCoupon}
          onClose={() => setEditingCoupon(null)}
          onSave={saveEditedCoupon}
        />
      )}
    </div>
  );
};

export default CouponsList;
