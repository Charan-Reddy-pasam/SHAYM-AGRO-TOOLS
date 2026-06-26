import React, { useEffect, useMemo, useState } from 'react';
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
import { getOrders } from '../api/orders';

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

// Helper to normalise the order shape from the API
const normaliseOrder = (o) => ({
  id: o.id || o.orderId || '',
  invoiceNo: o.invoiceNo || o.invoiceNumber || `INV-${o.id}`,
  customer: o.customerName || o.customer || (o.customerDetails?.name) || 'Unknown',
  customerType: o.customerType || (o.customerDetails?.type) || 'Farmer',
  phone: o.phone || o.customerPhone || (o.customerDetails?.phone) || '',
  email: o.email || o.customerEmail || (o.customerDetails?.email) || '',
  date: o.orderDate ? o.orderDate.slice(0, 10) : (o.date || ''),
  deliveryDate: o.deliveryDate ? o.deliveryDate.slice(0, 10) : (o.expectedDelivery || 'TBD'),
  total: Number(o.totalAmount || o.finalAmount || o.total || 0),
  paid: Number(o.paidAmount || o.paid || 0),
  status: o.status || 'Processing',
  paymentStatus: o.paymentStatus || 'Pending',
  payMethod: o.paymentMethod || o.payMethod || '',
  logistics: o.logistics || o.logisticsPartner || '',
  trackingNo: o.trackingNumber || o.trackingNo || '',
  shippingAddress: o.shippingAddress || '',
  billingAddress: o.billingAddress || '',
  notes: o.notes || o.adminNotes || '',
  items: Array.isArray(o.items) ? o.items.map(i => ({
    sku: i.sku || i.productSku || '',
    name: i.name || i.productName || '',
    category: i.category || '',
    qty: Number(i.quantity || i.qty || 0),
    price: Number(i.unitPrice || i.price || 0)
  })) : [],
  timeline: Array.isArray(o.timeline) ? o.timeline : []
});

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getOrders();
        if (isMounted) {
          const list = Array.isArray(data) ? data : (data.orders || data.data || []);
          setOrders(list.map(normaliseOrder));
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load orders.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch = [String(order.id), order.customer, order.invoiceNo, order.phone]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totals = useMemo(() => {
    return orders.reduce(
      (summary, order) => ({
        revenue: summary.revenue + order.total,
        processing: summary.processing + (order.status === 'Processing' ? 1 : 0),
        dispatched: summary.dispatched + (order.status === 'Dispatched' ? 1 : 0)
      }),
      { revenue: 0, processing: 0, dispatched: 0 }
    );
  }, [orders]);

  if (loading) {
    return (
      <div className="orders-page">
        <section className="catalog-header orders-header">
          <div className="catalog-title-wrap">
            <span className="catalog-kicker">Orders</span>
            <h1>Orders Management</h1>
            <p>Loading orders from server...</p>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <section className="catalog-header orders-header">
          <div className="catalog-title-wrap">
            <span className="catalog-kicker">Orders</span>
            <h1>Orders Management</h1>
            <p style={{ color: 'var(--danger, #dc2626)' }}>{error}</p>
          </div>
        </section>
      </div>
    );
  }

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
          {orders.length > 0 && (
            <Link className="catalog-btn catalog-btn--primary" to={`/admin/orders/details/${orders[0].id}`}>
              <PackageCheck size={16} />
              Open Latest
            </Link>
          )}
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
                      <span>{order.logistics || '—'}</span>
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
