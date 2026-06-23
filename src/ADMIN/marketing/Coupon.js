import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Percent,
  RotateCcw,
  Save,
  ShieldCheck,
  Tag
} from 'lucide-react';
import '../catalog/adminModule.css';
import { createCoupon } from './api';

const initialCoupon = {
  code: 'MONSOON20',
  description: '20% off on all organic seeds and seedlings',
  discount: '20',
  type: 'Percentage',
  minSpend: '1500',
  maxDiscount: '500',
  startDate: '2026-06-01',
  endDate: '2026-08-31',
  usageLimit: '500',
  perCustomerLimit: '1',
  status: 'Active',
  audience: 'All Customers'
};

const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

const Coupon = () => {
  const [formData, setFormData] = useState(initialCoupon);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const previewDiscount = React.useMemo(() => {
    if (formData.type === 'Percentage') return `${formData.discount || 0}%`;
    if (formData.type === 'Shipping') return 'Free Delivery';
    return formatCurrency(formData.discount);
  }, [formData.discount, formData.type]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'code' ? value.toUpperCase() : value }));
    setError(null);
  };

  const handleReset = () => {
    setFormData(initialCoupon);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await createCoupon(formData);
      navigate('/admin/marketing/coupons');
    } catch (err) {
      setError('Failed to create coupon. Please check the data and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="coupons-page coupon-form-page">
      <section className="catalog-header coupons-header">
        <div className="catalog-title-wrap">
          <Link className="coupon-back-link" to="/admin/marketing/coupons">
            <ArrowLeft size={16} />
            Back to coupons
          </Link>
          <span className="catalog-kicker">Coupon Builder</span>
          <h1>Create Coupon</h1>
          <p>Build cart-ready campaign rules with discount values, purchase limits, seasonal validity, and customer eligibility.</p>
        </div>
        <div className="coupon-preview-ticket">
          <span>{formData.code || 'COUPON'}</span>
          <strong>{previewDiscount}</strong>
          <small>Minimum cart {formatCurrency(formData.minSpend)}</small>
        </div>
      </section>

      {error && <div className="catalog-alert catalog-alert--error">{error}</div>}

      <form className="coupon-form-layout" onSubmit={handleSubmit}>
        <main className="catalog-stack">
          {/* Campaign Details */}
          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Campaign Details</h2>
                <p className="catalog-card__subtitle">The customer-facing code, message, and coupon type used during checkout.</p>
              </div>
            </div>
            <div className="catalog-form-grid">
              <div className="catalog-field">
                <label htmlFor="code">Coupon Code</label>
                <input id="code" name="code" value={formData.code} onChange={handleInputChange} placeholder="MONSOON20" required />
              </div>
              <div className="catalog-field">
                <label htmlFor="type">Discount Type</label>
                <select id="type" name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="Percentage">Percentage</option>
                  <option value="Flat Amount">Flat Amount</option>
                  <option value="Shipping">Free Delivery</option>
                </select>
              </div>
              <div className="catalog-field catalog-field--full">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={2} value={formData.description} onChange={handleInputChange} required />
              </div>
            </div>
          </section>

          {/* Discount Rules */}
          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Discount Rules</h2>
                <p className="catalog-card__subtitle">Control offer value, cart eligibility, caps, and usage limits.</p>
              </div>
            </div>
            <div className="catalog-form-grid catalog-form-grid--three">
              <div className="catalog-field">
                <label htmlFor="discount">Discount Value</label>
                <input id="discount" name="discount" type="number" value={formData.discount} onChange={handleInputChange} disabled={formData.type === 'Shipping'} required={formData.type !== 'Shipping'} />
              </div>
              <div className="catalog-field">
                <label htmlFor="maxDiscount">Maximum Discount Cap</label>
                <input id="maxDiscount" name="maxDiscount" type="number" value={formData.maxDiscount} onChange={handleInputChange} />
              </div>
              <div className="catalog-field">
                <label htmlFor="minSpend">Minimum Cart Value</label>
                <input id="minSpend" name="minSpend" type="number" value={formData.minSpend} onChange={handleInputChange} />
              </div>
              <div className="catalog-field">
                <label htmlFor="usageLimit">Total Usage Limit</label>
                <input id="usageLimit" name="usageLimit" type="number" value={formData.usageLimit} onChange={handleInputChange} />
              </div>
              <div className="catalog-field">
                <label htmlFor="perCustomerLimit">Per Customer Limit</label>
                <input id="perCustomerLimit" name="perCustomerLimit" type="number" value={formData.perCustomerLimit} onChange={handleInputChange} />
              </div>
            </div>
          </section>

          {/* Validity & Audience */}
          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Validity & Audience</h2>
                <p className="catalog-card__subtitle">Set campaign dates and target audience.</p>
              </div>
            </div>
            <div className="catalog-form-grid catalog-form-grid--three">
              <div className="catalog-field">
                <label htmlFor="startDate">Start Date</label>
                <input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
              </div>
              <div className="catalog-field">
                <label htmlFor="endDate">End Date</label>
                <input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
              </div>
              <div className="catalog-field">
                <label htmlFor="status">Campaign Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="catalog-field">
                <label htmlFor="audience">Audience</label>
                <select id="audience" name="audience" value={formData.audience} onChange={handleInputChange}>
                  <option value="All Customers">All Customers</option>
                  <option value="New Customers">New Customers</option>
                  <option value="Returning Customers">Returning Customers</option>
                  <option value="High Value Customers">High Value Customers</option>
                </select>
              </div>
            </div>
          </section>
        </main>

        <aside className="catalog-stack">
          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Live Preview</h2>
                <p className="catalog-card__subtitle">How the campaign reads before checkout integration.</p>
              </div>
            </div>
            <div className="coupon-preview-card">
              <Tag size={22} />
              <span>{formData.code || 'COUPON'}</span>
              <strong>{previewDiscount}</strong>
              <p>{formData.description || 'Coupon description will appear here.'}</p>
            </div>
          </section>

          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Rule Summary</h2>
                <p className="catalog-card__subtitle">Quick operational check.</p>
              </div>
            </div>
            <div className="coupon-summary-list">
              <div><Percent size={17} /> <span>{previewDiscount} discount type: {formData.type}</span></div>
              <div><ShieldCheck size={17} /> <span>Minimum cart {formatCurrency(formData.minSpend)}, cap {formatCurrency(formData.maxDiscount)}</span></div>
              <div><Calendar size={17} /> <span>{formData.startDate} to {formData.endDate}</span></div>
              <div><ClipboardList size={17} /> <span>{formData.usageLimit} total uses, {formData.perCustomerLimit} per customer</span></div>
            </div>
          </section>

          <div className="coupon-form-actions">
            <button className="catalog-btn" type="button" onClick={handleReset} disabled={isSaving}>
              <RotateCcw size={16} />
              Reset
            </button>
            <button className="catalog-btn catalog-btn--primary" type="submit" disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Coupon'}
            </button>
            <Link className="catalog-btn" to="/admin/marketing/coupons">
              <ClipboardList size={16} />
              View Coupons
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default Coupon;
