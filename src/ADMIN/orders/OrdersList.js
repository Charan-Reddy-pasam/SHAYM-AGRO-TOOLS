import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  PackageCheck,
  Search,
  Truck
} from 'lucide-react';
import '../catalog/adminModule.css';

export const adminOrders = [
  {
    id: 'ORD-9932',
    invoiceNo: 'SAT/26/09932',
    customer: 'Rajinder Singh',
    customerType: 'Farmer',
    phone: '+91 98765-12345',
    email: 'rajinder.singh@gmail.com',
    date: '2026-05-26',
    deliveryDate: '2026-05-29',
    total: 7240,
    paid: 7240,
    status: 'Dispatched',
    paymentStatus: 'Paid',
    payMethod: 'UPI / GPay',
    logistics: 'AgroCargo Express',
    trackingNo: 'AGC-553901',
    shippingAddress: 'Village Kharar, Ludhiana, Punjab 141001',
    billingAddress: 'Village Kharar, Ludhiana, Punjab 141001',
    notes: 'Customer requested delivery before the weekend sowing schedule.',
    items: [
      { sku: 'SAT-HT-110', name: 'Heavy Duty Hand Tiller', category: 'Farm Tools', qty: 1, price: 4200 },
      { sku: 'SAT-SP-042', name: 'Brass Knapsack Sprayer Nozzle Set', category: 'Sprayer Parts', qty: 2, price: 980 },
      { sku: 'SAT-GL-018', name: 'Cut Resistant Farm Gloves', category: 'Safety', qty: 3, price: 360 }
    ],
    timeline: [
      { label: 'Order placed', date: '26 May 2026, 10:20 AM', done: true },
      { label: 'Payment received', date: '26 May 2026, 10:24 AM', done: true },
      { label: 'Packed for dispatch', date: '27 May 2026, 04:10 PM', done: true },
      { label: 'In transit', date: '28 May 2026, 09:35 AM', done: true }
    ]
  },
  {
    id: 'ORD-9821',
    invoiceNo: 'SAT/26/09821',
    customer: 'Ganesh Kulkarni',
    customerType: 'Farmer',
    phone: '+91 94220-98765',
    email: 'ganesh.k@outlook.com',
    date: '2026-05-24',
    deliveryDate: '2026-05-24',
    total: 1490,
    paid: 1490,
    status: 'Completed',
    paymentStatus: 'Collected',
    payMethod: 'Cash on Delivery',
    logistics: 'Self Pickup',
    trackingNo: 'PICKUP-09821',
    shippingAddress: 'Shyam Agro Tools Store Counter, Pune, Maharashtra',
    billingAddress: 'Baramati Road, Pune, Maharashtra 413102',
    notes: 'Self pickup completed from store counter.',
    items: [
      { sku: 'SAT-SC-022', name: 'Carbon Steel Pruning Secateur', category: 'Garden Tools', qty: 1, price: 780 },
      { sku: 'SAT-RP-014', name: 'Drip Irrigation Repair Kit', category: 'Irrigation', qty: 1, price: 710 }
    ],
    timeline: [
      { label: 'Order placed', date: '24 May 2026, 11:15 AM', done: true },
      { label: 'Ready for pickup', date: '24 May 2026, 01:00 PM', done: true },
      { label: 'Payment collected', date: '24 May 2026, 04:40 PM', done: true },
      { label: 'Order completed', date: '24 May 2026, 04:45 PM', done: true }
    ]
  },
  {
    id: 'ORD-9755',
    invoiceNo: 'SAT/26/09755',
    customer: 'Greenfields Agri Solutions',
    customerType: 'Retailer',
    phone: '+91 84477-11223',
    email: 'sales@greenfieldagri.com',
    date: '2026-05-22',
    deliveryDate: '2026-05-30',
    total: 42800,
    paid: 30000,
    status: 'Processing',
    paymentStatus: 'Part Paid',
    payMethod: 'Bank Transfer',
    logistics: 'Safexpress Agro',
    trackingNo: 'Pending assignment',
    shippingAddress: 'Plot 18, Agro Market Yard, Karnal, Haryana 132001',
    billingAddress: 'Greenfields Agri Solutions, Karnal, Haryana 132001',
    notes: 'Bulk retailer order. Balance payment expected before dispatch.',
    items: [
      { sku: 'SAT-KD-008', name: 'Khurpi Deluxe Pack', category: 'Farm Tools', qty: 20, price: 640 },
      { sku: 'SAT-SP-088', name: 'Battery Sprayer 16L', category: 'Sprayers', qty: 5, price: 4200 },
      { sku: 'SAT-MC-011', name: 'Manual Seed Drill Attachment', category: 'Machinery', qty: 2, price: 4500 }
    ],
    timeline: [
      { label: 'Order placed', date: '22 May 2026, 09:05 AM', done: true },
      { label: 'Advance received', date: '22 May 2026, 02:15 PM', done: true },
      { label: 'Stock reserved', date: '23 May 2026, 12:30 PM', done: true },
      { label: 'Awaiting final packing', date: 'Pending', done: false }
    ]
  },
  {
    id: 'ORD-9701',
    invoiceNo: 'SAT/26/09701',
    customer: 'Amrit Pal Singh',
    customerType: 'Farmer',
    phone: '+91 99144-88990',
    email: 'amrit.pal@yahoo.com',
    date: '2026-05-21',
    deliveryDate: '2026-05-25',
    total: 14200,
    paid: 14200,
    status: 'Completed',
    paymentStatus: 'Paid',
    payMethod: 'Debit Card',
    logistics: 'AgroCargo Express',
    trackingNo: 'AGC-547118',
    shippingAddress: 'Kartarpur Road, Jalandhar, Punjab 144001',
    billingAddress: 'Kartarpur Road, Jalandhar, Punjab 144001',
    notes: 'Delivered with standard invoice copy.',
    items: [
      { sku: 'SAT-PM-120', name: 'Portable Milking Machine Hose Set', category: 'Dairy Tools', qty: 1, price: 6900 },
      { sku: 'SAT-FC-032', name: 'Foldable Crop Cutter', category: 'Harvesting', qty: 2, price: 3650 }
    ],
    timeline: [
      { label: 'Order placed', date: '21 May 2026, 03:30 PM', done: true },
      { label: 'Payment confirmed', date: '21 May 2026, 03:35 PM', done: true },
      { label: 'Dispatched', date: '22 May 2026, 10:10 AM', done: true },
      { label: 'Delivered', date: '25 May 2026, 05:50 PM', done: true }
    ]
  },
  {
    id: 'ORD-9610',
    invoiceNo: 'SAT/26/09610',
    customer: 'Chandra Reddy',
    customerType: 'Wholesaler',
    phone: '+91 89190-33445',
    email: 'reddy.agro@gmail.com',
    date: '2026-05-18',
    deliveryDate: '2026-06-01',
    total: 124000,
    paid: 75000,
    status: 'Processing',
    paymentStatus: 'Part Paid',
    payMethod: 'Bank Transfer',
    logistics: 'VRL Logistics',
    trackingNo: 'Pending assignment',
    shippingAddress: 'Cotton Market Road, Guntur, Andhra Pradesh 522001',
    billingAddress: 'Reddy Agro Wholesale, Guntur, Andhra Pradesh 522001',
    notes: 'Dispatch after procurement team confirms second batch stock.',
    items: [
      { sku: 'SAT-BS-016', name: 'Brush Cutter 52cc', category: 'Machinery', qty: 8, price: 9500 },
      { sku: 'SAT-BL-002', name: 'Brush Cutter Blade Kit', category: 'Machinery Spares', qty: 16, price: 3000 }
    ],
    timeline: [
      { label: 'Order placed', date: '18 May 2026, 01:05 PM', done: true },
      { label: 'Advance received', date: '18 May 2026, 05:25 PM', done: true },
      { label: 'Procurement review', date: '20 May 2026, 12:00 PM', done: true },
      { label: 'Packing pending', date: 'Pending', done: false }
    ]
  },
  {
    id: 'ORD-9504',
    invoiceNo: 'SAT/26/09504',
    customer: 'Devendra Prasad',
    customerType: 'Farmer',
    phone: '+91 70045-66778',
    email: 'devendra.prasad@gmail.com',
    date: '2026-05-15',
    deliveryDate: 'Cancelled',
    total: 11900,
    paid: 0,
    status: 'Cancelled',
    paymentStatus: 'Refund Not Needed',
    payMethod: 'UPI / GPay',
    logistics: 'None',
    trackingNo: 'Cancelled before dispatch',
    shippingAddress: 'Patna Rural, Bihar 800020',
    billingAddress: 'Patna Rural, Bihar 800020',
    notes: 'Customer cancelled because item was no longer required.',
    items: [
      { sku: 'SAT-PU-036', name: 'Portable Water Pump 1HP', category: 'Irrigation', qty: 1, price: 11900 }
    ],
    timeline: [
      { label: 'Order placed', date: '15 May 2026, 09:42 AM', done: true },
      { label: 'Cancellation requested', date: '15 May 2026, 11:10 AM', done: true },
      { label: 'Order cancelled', date: '15 May 2026, 11:30 AM', done: true }
    ]
  }
];

export const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

export const statusMeta = {
  Completed: { icon: CheckCircle2, className: 'order-status--completed' },
  Processing: { icon: Clock3, className: 'order-status--processing' },
  Dispatched: { icon: Truck, className: 'order-status--dispatched' },
  Cancelled: { icon: AlertCircle, className: 'order-status--cancelled' }
};

export const OrderStatusBadge = ({ status }) => {
  const meta = statusMeta[status] || statusMeta.Processing;
  const Icon = meta.icon;

  return (
    <span className={`order-status ${meta.className}`}>
      <Icon size={14} />
      {status}
    </span>
  );
};

const OrdersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return adminOrders.filter((order) => {
      const matchesSearch = [order.id, order.customer, order.invoiceNo, order.phone]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totals = useMemo(() => {
    return adminOrders.reduce(
      (summary, order) => ({
        revenue: summary.revenue + order.total,
        processing: summary.processing + (order.status === 'Processing' ? 1 : 0),
        dispatched: summary.dispatched + (order.status === 'Dispatched' ? 1 : 0)
      }),
      { revenue: 0, processing: 0, dispatched: 0 }
    );
  }, []);

  return (
    <div className="orders-page">
      <section className="catalog-header orders-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Orders</span>
          <h1>Orders Management</h1>
          <p>Track invoices, customer commitments, payment status, and dispatch movement from one clean ledger.</p>
        </div>

        <div className="orders-metrics">
          <div>
            <span>Total Revenue</span>
            <strong>{formatCurrency(totals.revenue)}</strong>
          </div>
          <div>
            <span>Processing</span>
            <strong>{totals.processing}</strong>
          </div>
          <div>
            <span>Dispatched</span>
            <strong>{totals.dispatched}</strong>
          </div>
        </div>
      </section>

      <section className="catalog-card">
        <div className="catalog-card__header">
          <div>
            <h2>Order Ledger</h2>
            <p className="catalog-card__subtitle">{filteredOrders.length} orders currently match your view.</p>
          </div>
          <Link className="catalog-btn catalog-btn--primary" to={`/admin/orders/details/${adminOrders[0].id}`}>
            <PackageCheck size={16} />
            Open Latest
          </Link>
        </div>

        <div className="catalog-filterbar">
          <div className="catalog-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search order ID, invoice, customer, or phone"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <label className="catalog-filter">
            <Filter size={16} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All statuses</option>
              <option value="Processing">Processing</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
        </div>

        <div className="catalog-table-wrap">
          <table className="catalog-table orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Booking Date</th>
                <th>Logistics</th>
                <th>Payment</th>
                <th className="catalog-number-cell">Invoice Value</th>
                <th>Status</th>
                <th className="catalog-center-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="catalog-table__title">#{order.id}</div>
                    <div className="catalog-table__muted">{order.invoiceNo}</div>
                  </td>
                  <td>
                    <div className="catalog-table__title">{order.customer}</div>
                    <div className="catalog-table__muted">{order.customerType} | {order.phone}</div>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <div className="orders-logistics">
                      <Truck size={15} />
                      <span>{order.logistics}</span>
                    </div>
                  </td>
                  <td>
                    <div className="catalog-table__title">{order.paymentStatus}</div>
                    <div className="catalog-table__muted">{order.payMethod}</div>
                  </td>
                  <td className="catalog-number-cell">{formatCurrency(order.total)}</td>
                  <td><OrderStatusBadge status={order.status} /></td>
                  <td className="catalog-center-cell">
                    <Link className="catalog-btn catalog-btn--icon" to={`/admin/orders/details/${order.id}`} title="View order details">
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {!filteredOrders.length && (
                <tr>
                  <td colSpan="8">
                    <div className="orders-empty">No orders match the current search or status filter.</div>
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

export default OrdersList;
