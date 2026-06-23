import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Truck
} from 'lucide-react';
import '../catalog/adminModule.css';

export const supplierCategories = [
  'Farm Tools',
  'Irrigation',
  'Machinery',
  'Seeds & Inputs',
  'Safety Gear',
  'Packaging'
];

export const suppliers = [
  {
    id: 'SUP-001',
    name: 'KisanKraft Ltd.',
    category: 'Farm Tools',
    contactPerson: 'Amit Sharma',
    email: 'procurement@kisankraft.in',
    phone: '+91 80411-23456',
    city: 'Bengaluru, Karnataka',
    status: 'Verified',
    leadTime: '4-6 days',
    rating: 4.8,
    activePo: 7,
    monthlySpend: 286000,
    lastSupply: '2026-05-27',
    terms: 'Net 15',
    products: 'Tillers, pruning tools, crop cutters'
  },
  {
    id: 'SUP-002',
    name: 'AgroEquip Co.',
    category: 'Irrigation',
    contactPerson: 'Neha Patel',
    email: 'orders@agroequip.co.in',
    phone: '+91 98250-88221',
    city: 'Ahmedabad, Gujarat',
    status: 'Verified',
    leadTime: '3-5 days',
    rating: 4.6,
    activePo: 4,
    monthlySpend: 174500,
    lastSupply: '2026-05-24',
    terms: 'Advance 30%',
    products: 'Drip kits, pumps, hose connectors'
  },
  {
    id: 'SUP-003',
    name: 'Bharat Agro Machinery',
    category: 'Machinery',
    contactPerson: 'Rakesh Verma',
    email: 'sales@bharatagromachinery.com',
    phone: '+91 98110-77144',
    city: 'Ludhiana, Punjab',
    status: 'Review',
    leadTime: '8-12 days',
    rating: 4.1,
    activePo: 2,
    monthlySpend: 412000,
    lastSupply: '2026-05-18',
    terms: 'Net 30',
    products: 'Brush cutters, seed drill attachments'
  },
  {
    id: 'SUP-004',
    name: 'GreenSafe Protective Works',
    category: 'Safety Gear',
    contactPerson: 'Farhan Khan',
    email: 'dispatch@greensafe.in',
    phone: '+91 99888-44112',
    city: 'Delhi NCR',
    status: 'Verified',
    leadTime: '2-4 days',
    rating: 4.7,
    activePo: 3,
    monthlySpend: 68400,
    lastSupply: '2026-05-29',
    terms: 'Net 7',
    products: 'Farm gloves, masks, eye protection'
  },
  {
    id: 'SUP-005',
    name: 'Krishi Seed & Inputs',
    category: 'Seeds & Inputs',
    contactPerson: 'Sandeep Rao',
    email: 'hello@krishiinputs.in',
    phone: '+91 99002-66718',
    city: 'Hyderabad, Telangana',
    status: 'Pending',
    leadTime: '5-7 days',
    rating: 3.9,
    activePo: 1,
    monthlySpend: 92000,
    lastSupply: '2026-05-11',
    terms: 'Advance 50%',
    products: 'Hybrid seeds, soil additives'
  },
  {
    id: 'SUP-006',
    name: 'PackRight Rural Logistics',
    category: 'Packaging',
    contactPerson: 'Meera Iyer',
    email: 'support@packright.in',
    phone: '+91 94444-21890',
    city: 'Chennai, Tamil Nadu',
    status: 'Inactive',
    leadTime: '6-9 days',
    rating: 3.5,
    activePo: 0,
    monthlySpend: 18500,
    lastSupply: '2026-04-30',
    terms: 'COD',
    products: 'Cartons, tapes, woven sacks'
  }
];

export const formatSupplierCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

const supplierStatusMeta = {
  Verified: { icon: CheckCircle2, className: 'supplier-status--verified' },
  Pending: { icon: AlertTriangle, className: 'supplier-status--pending' },
  Review: { icon: ShieldCheck, className: 'supplier-status--review' },
  Inactive: { icon: AlertTriangle, className: 'supplier-status--inactive' }
};

const SupplierStatusBadge = ({ status }) => {
  const meta = supplierStatusMeta[status] || supplierStatusMeta.Pending;
  const Icon = meta.icon;

  return (
    <span className={`supplier-status ${meta.className}`}>
      <Icon size={14} />
      {status}
    </span>
  );
};

const SuppliersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch = [
        supplier.id,
        supplier.name,
        supplier.contactPerson,
        supplier.email,
        supplier.phone,
        supplier.city,
        supplier.products
      ].join(' ').toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All' || supplier.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || supplier.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    return suppliers.reduce(
      (acc, supplier) => ({
        verified: acc.verified + (supplier.status === 'Verified' ? 1 : 0),
        activePo: acc.activePo + supplier.activePo,
        spend: acc.spend + supplier.monthlySpend
      }),
      { verified: 0, activePo: 0, spend: 0 }
    );
  }, []);

  return (
    <div className="suppliers-page">
      <section className="catalog-header suppliers-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Suppliers</span>
          <h1>Supplier Management</h1>
          <p>Manage approved vendors, procurement contacts, category coverage, lead times, and purchase order exposure.</p>
        </div>

        <div className="suppliers-metrics">
          <div>
            <span>Verified Vendors</span>
            <strong>{summary.verified}</strong>
          </div>
          <div>
            <span>Active POs</span>
            <strong>{summary.activePo}</strong>
          </div>
          <div>
            <span>Monthly Spend</span>
            <strong>{formatSupplierCurrency(summary.spend)}</strong>
          </div>
        </div>
      </section>

      <section className="catalog-card">
        <div className="catalog-card__header">
          <div>
            <h2>Vendor Directory</h2>
            <p className="catalog-card__subtitle">{filteredSuppliers.length} suppliers match your current filters.</p>
          </div>
          <Link className="catalog-btn catalog-btn--primary" to="/admin/suppliers/add">
            <Plus size={16} />
            Add Supplier
          </Link>
        </div>

        <div className="catalog-filterbar suppliers-filterbar">
          <div className="catalog-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search supplier, contact, city, phone, or product"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <label className="catalog-filter">
            <Filter size={16} />
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="All">All categories</option>
              {supplierCategories.map((category) => (
                <option value={category} key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="catalog-filter">
            <ShieldCheck size={16} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Review">Review</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="catalog-table-wrap">
          <table className="catalog-table suppliers-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Category</th>
                <th>Lead Time</th>
                <th className="catalog-center-cell">Active POs</th>
                <th className="catalog-number-cell">Monthly Spend</th>
                <th>Status</th>
                <th className="catalog-center-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div className="catalog-table__title">{supplier.name}</div>
                    <div className="catalog-table__muted">{supplier.id} | Rating {supplier.rating}/5</div>
                    <div className="supplier-location">
                      <MapPin size={13} />
                      {supplier.city}
                    </div>
                  </td>
                  <td>
                    <div className="catalog-table__title">{supplier.contactPerson}</div>
                    <div className="supplier-contact-line">
                      <Phone size={13} />
                      {supplier.phone}
                    </div>
                    <div className="supplier-contact-line">
                      <Mail size={13} />
                      {supplier.email}
                    </div>
                  </td>
                  <td>
                    <span className="catalog-badge">{supplier.category}</span>
                    <div className="catalog-table__muted">{supplier.products}</div>
                  </td>
                  <td>
                    <div className="supplier-lead-time">
                      <Truck size={15} />
                      {supplier.leadTime}
                    </div>
                    <div className="catalog-table__muted">Last: {supplier.lastSupply}</div>
                  </td>
                  <td className="catalog-center-cell">{supplier.activePo}</td>
                  <td className="catalog-number-cell">{formatSupplierCurrency(supplier.monthlySpend)}</td>
                  <td><SupplierStatusBadge status={supplier.status} /></td>
                  <td className="catalog-center-cell">
                    <button className="catalog-btn catalog-btn--icon" type="button" title="View supplier snapshot">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {!filteredSuppliers.length && (
                <tr>
                  <td colSpan="8">
                    <div className="suppliers-empty">No suppliers match the current search or filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SuppliersList;
