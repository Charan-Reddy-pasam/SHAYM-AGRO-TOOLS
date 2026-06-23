import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { supplierCategories } from './SuppliersList';
import '../catalog/adminModule.css';

const initialSupplier = {
  name: '',
  contactPerson: '',
  category: supplierCategories[0],
  status: 'Pending',
  email: '',
  phone: '',
  city: '',
  address: '',
  gstin: '',
  leadTime: '',
  paymentTerms: 'Net 15',
  productLines: '',
  notes: ''
};

const SuppliersForm = () => {
  const [supplier, setSupplier] = useState(initialSupplier);
  const [savedMessage, setSavedMessage] = useState('');

  const completionScore = useMemo(() => {
    const requiredFields = ['name', 'contactPerson', 'email', 'phone', 'city', 'address', 'productLines'];
    const completed = requiredFields.filter((field) => supplier[field].trim()).length;
    return Math.round((completed / requiredFields.length) * 100);
  }, [supplier]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSupplier((prev) => ({ ...prev, [name]: value }));
    setSavedMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSavedMessage(`${supplier.name || 'Supplier'} has been prepared for onboarding review.`);
  };

  const handleReset = () => {
    setSupplier(initialSupplier);
    setSavedMessage('');
  };

  return (
    <div className="suppliers-page supplier-form-page">
      <section className="catalog-header suppliers-header">
        <div className="catalog-title-wrap">
          <Link className="suppliers-back-link" to="/admin/suppliers/list">
            <ArrowLeft size={16} />
            Back to suppliers
          </Link>
          <span className="catalog-kicker">Supplier Onboarding</span>
          <h1>Add Supplier</h1>
          <p>Create a clean supplier profile for procurement, purchase orders, dispatch planning, and compliance review.</p>
        </div>

        <div className="supplier-form-score">
          <span>Profile Completion</span>
          <strong>{completionScore}%</strong>
          <div>
            <span style={{ width: `${completionScore}%` }} />
          </div>
        </div>
      </section>

      {savedMessage && (
        <div className="catalog-alert">
          <CheckCircle2 size={18} />
          {savedMessage}
        </div>
      )}

      <form className="supplier-form-layout" onSubmit={handleSubmit}>
        <main className="catalog-stack">
          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Company Information</h2>
                <p className="catalog-card__subtitle">Primary supplier identity and procurement classification.</p>
              </div>
            </div>

            <div className="catalog-form-grid">
              <div className="catalog-field">
                <label htmlFor="name">Supplier Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={supplier.name}
                  onChange={handleChange}
                  placeholder="e.g. KisanKraft Ltd."
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="contactPerson">Contact Person</label>
                <input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  value={supplier.contactPerson}
                  onChange={handleChange}
                  placeholder="Procurement contact name"
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={supplier.category} onChange={handleChange}>
                  {supplierCategories.map((category) => (
                    <option value={category} key={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="catalog-field">
                <label htmlFor="status">Approval Status</label>
                <select id="status" name="status" value={supplier.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="Review">Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="catalog-field">
                <label htmlFor="gstin">GSTIN / Tax ID</label>
                <input
                  id="gstin"
                  name="gstin"
                  type="text"
                  value={supplier.gstin}
                  onChange={handleChange}
                  placeholder="Optional tax registration"
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="productLines">Product Lines</label>
                <input
                  id="productLines"
                  name="productLines"
                  type="text"
                  value={supplier.productLines}
                  onChange={handleChange}
                  placeholder="Tillers, pumps, drip kits"
                  required
                />
              </div>
            </div>
          </section>

          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Contact & Address</h2>
                <p className="catalog-card__subtitle">Communication details used by purchasing and dispatch teams.</p>
              </div>
            </div>

            <div className="catalog-form-grid">
              <div className="catalog-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={supplier.email}
                  onChange={handleChange}
                  placeholder="orders@supplier.com"
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={supplier.phone}
                  onChange={handleChange}
                  placeholder="+91 98765-43210"
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="city">City / Region</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={supplier.city}
                  onChange={handleChange}
                  placeholder="City, State"
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="leadTime">Average Lead Time</label>
                <input
                  id="leadTime"
                  name="leadTime"
                  type="text"
                  value={supplier.leadTime}
                  onChange={handleChange}
                  placeholder="e.g. 4-6 days"
                />
              </div>

              <div className="catalog-field catalog-field--full">
                <label htmlFor="address">Registered Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={supplier.address}
                  onChange={handleChange}
                  placeholder="Street, industrial area, city, state, PIN"
                  required
                />
              </div>
            </div>
          </section>
        </main>

        <aside className="catalog-stack">
          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Commercial Terms</h2>
                <p className="catalog-card__subtitle">Internal details for purchase planning.</p>
              </div>
            </div>

            <div className="catalog-form">
              <div className="catalog-field">
                <label htmlFor="paymentTerms">Payment Terms</label>
                <select id="paymentTerms" name="paymentTerms" value={supplier.paymentTerms} onChange={handleChange}>
                  <option value="Net 7">Net 7</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Advance 30%">Advance 30%</option>
                  <option value="Advance 50%">Advance 50%</option>
                  <option value="COD">COD</option>
                </select>
              </div>

              <div className="catalog-field">
                <label htmlFor="notes">Procurement Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={supplier.notes}
                  onChange={handleChange}
                  placeholder="Quality checks, delivery preferences, preferred dispatch days..."
                />
              </div>
            </div>
          </section>

          <section className="catalog-card supplier-preview-card">
            <div className="catalog-card__header">
              <div>
                <h2>Supplier Snapshot</h2>
                <p className="catalog-card__subtitle">Quick review before saving.</p>
              </div>
            </div>

            <div className="supplier-preview-list">
              <div>
                <Building2 size={17} />
                <span>{supplier.name || 'Supplier name'}</span>
              </div>
              <div>
                <ShieldCheck size={17} />
                <span>{supplier.status} | {supplier.category}</span>
              </div>
              <div>
                <Phone size={17} />
                <span>{supplier.phone || 'Phone number'}</span>
              </div>
              <div>
                <Mail size={17} />
                <span>{supplier.email || 'Email address'}</span>
              </div>
              <div>
                <MapPin size={17} />
                <span>{supplier.city || 'City / region'}</span>
              </div>
              <div>
                <Truck size={17} />
                <span>{supplier.leadTime || 'Lead time not set'}</span>
              </div>
            </div>
          </section>

          <div className="supplier-form-actions">
            <button className="catalog-btn" type="button" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset
            </button>
            <button className="catalog-btn catalog-btn--primary" type="submit">
              <Save size={16} />
              Save Supplier
            </button>
            <Link className="catalog-btn" to="/admin/suppliers/list">
              <ClipboardList size={16} />
              View List
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default SuppliersForm;
