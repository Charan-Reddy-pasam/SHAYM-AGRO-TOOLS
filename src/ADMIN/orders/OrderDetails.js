import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  Save,
  Truck
} from 'lucide-react';
import {
  formatCurrency,
  OrderStatusBadge
} from './OrdersList';
import { getOrder, updateOrderStatus, deleteOrder } from '../api/orders';
import '../catalog/adminModule.css';

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="order-detail-item">
    <span className="order-detail-item__icon"><Icon size={17} /></span>
    <div>
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  </div>
);

// Normalise raw API response into a consistent shape for display
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

const STATUS_OPTIONS = ['Processing', 'Dispatched', 'Completed', 'Cancelled'];

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getOrder(orderId);
        if (isMounted) {
          const normalised = normaliseOrder(data);
          setOrder(normalised);
          setSelectedStatus(normalised.status);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load order.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order.status) return;
    setUpdatingStatus(true);
    setStatusMsg('');
    try {
      await updateOrderStatus(orderId, selectedStatus);
      setOrder(prev => ({ ...prev, status: selectedStatus }));
      setStatusMsg('Status updated successfully.');
    } catch (err) {
      setStatusMsg(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
    try {
      await deleteOrder(orderId);
      window.history.back();
    } catch (err) {
      alert(err.message || 'Failed to delete order.');
    }
  };

  if (loading) {
    return (
      <div className="orders-page order-details-page">
        <section className="catalog-header orders-header order-details-hero">
          <div className="catalog-title-wrap">
            <Link className="orders-back-link" to="/admin/orders/list">
              <ArrowLeft size={16} /> Back to orders
            </Link>
            <span className="catalog-kicker">Order Details</span>
            <h1>Loading...</h1>
            <p>Fetching order data from server.</p>
          </div>
        </section>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="orders-page order-details-page">
        <section className="catalog-header orders-header order-details-hero">
          <div className="catalog-title-wrap">
            <Link className="orders-back-link" to="/admin/orders/list">
              <ArrowLeft size={16} /> Back to orders
            </Link>
            <span className="catalog-kicker">Order Details</span>
            <h1>Error</h1>
            <p style={{ color: 'var(--danger, #dc2626)' }}>{error || 'Order not found.'}</p>
          </div>
        </section>
      </div>
    );
  }

  const itemSubtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = order.status === 'Cancelled' || order.logistics === 'Self Pickup' ? 0 : 240;
  const discount = Math.max(itemSubtotal + shipping - order.total, 0);
  const balance = Math.max(order.total - order.paid, 0);

  return (
    <div className="orders-page order-details-page">
      <section className="catalog-header orders-header order-details-hero">
        <div className="catalog-title-wrap">
          <Link className="orders-back-link" to="/admin/orders/list">
            <ArrowLeft size={16} />
            Back to orders
          </Link>
          <span className="catalog-kicker">Order Details</span>
          <h1>#{order.id}</h1>
          <p>{order.customer} | Invoice {order.invoiceNo}</p>
        </div>

        <div className="order-details-actions">
          <OrderStatusBadge status={order.status} />
          <Link className="catalog-btn catalog-btn--primary" to="/admin/orders/list">
            <ClipboardList size={16} />
            Ledger
          </Link>
        </div>
      </section>

      <section className="order-summary-grid">
        <DetailItem icon={CalendarDays} label="Booking Date" value={order.date} />
        <DetailItem icon={Truck} label="Delivery Target" value={order.deliveryDate} />
        <DetailItem icon={CreditCard} label="Payment Status" value={order.paymentStatus} />
        <DetailItem icon={ReceiptText} label="Invoice Value" value={formatCurrency(order.total)} />
      </section>

      <div className="order-details-layout">
        <main className="catalog-stack">
          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Purchased Items</h2>
                <p className="catalog-card__subtitle">Products included in this order with unit pricing and quantities.</p>
              </div>
            </div>

            <div className="catalog-table-wrap">
              <table className="catalog-table order-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th className="catalog-center-cell">Qty</th>
                    <th className="catalog-number-cell">Unit Price</th>
                    <th className="catalog-number-cell">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.length > 0 ? order.items.map((item, idx) => (
                    <tr key={item.sku || idx}>
                      <td>
                        <div className="catalog-table__title">{item.name}</div>
                        <div className="catalog-table__muted">{item.sku}</div>
                      </td>
                      <td>{item.category}</td>
                      <td className="catalog-center-cell">{item.qty}</td>
                      <td className="catalog-number-cell">{formatCurrency(item.price)}</td>
                      <td className="catalog-number-cell">{formatCurrency(item.price * item.qty)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                        No items found for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {order.timeline.length > 0 && (
            <section className="catalog-card">
              <div className="catalog-card__header">
                <div>
                  <h2>Fulfilment Timeline</h2>
                  <p className="catalog-card__subtitle">Operational progress for payment, packing, dispatch, and delivery.</p>
                </div>
              </div>

              <div className="order-timeline">
                {order.timeline.map((event, idx) => (
                  <div className={`order-timeline__row ${event.done ? 'is-done' : ''}`} key={idx}>
                    <span className="order-timeline__dot" />
                    <div>
                      <strong>{event.label}</strong>
                      <span>{event.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="catalog-stack">
          <section className="catalog-card order-total-card">
            <div className="catalog-card__header">
              <div>
                <h2>Payment Summary</h2>
                <p className="catalog-card__subtitle">{order.payMethod}</p>
              </div>
            </div>

            <dl className="order-totals">
              <div>
                <dt>Items subtotal</dt>
                <dd>{formatCurrency(itemSubtotal)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{shipping ? formatCurrency(shipping) : 'Included'}</dd>
              </div>
              <div>
                <dt>Discount / Adjustment</dt>
                <dd>{discount ? `-${formatCurrency(discount)}` : formatCurrency(0)}</dd>
              </div>
              <div className="order-totals__grand">
                <dt>Order Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
              <div>
                <dt>Paid</dt>
                <dd>{formatCurrency(order.paid)}</dd>
              </div>
              <div>
                <dt>Balance</dt>
                <dd>{formatCurrency(balance)}</dd>
              </div>
            </dl>
          </section>

          {/* Status Update Panel */}
          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Update Status</h2>
                <p className="catalog-card__subtitle">Change the fulfilment status of this order.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.25rem 0' }}>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                className="catalog-btn catalog-btn--primary"
                onClick={handleStatusUpdate}
                disabled={updatingStatus || selectedStatus === order.status}
              >
                <Save size={15} />
                {updatingStatus ? 'Saving...' : 'Save Status'}
              </button>
              {statusMsg && (
                <p style={{ fontSize: '0.78rem', color: statusMsg.includes('success') ? '#16a34a' : '#dc2626' }}>
                  {statusMsg}
                </p>
              )}
            </div>
          </section>

          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Customer</h2>
                <p className="catalog-card__subtitle">{order.customerType}</p>
              </div>
            </div>

            <div className="order-contact-card">
              <DetailItem icon={Phone} label="Phone" value={order.phone} />
              <DetailItem icon={Mail} label="Email" value={order.email} />
              <DetailItem icon={MapPin} label="Shipping Address" value={order.shippingAddress} />
              <DetailItem icon={ReceiptText} label="Billing Address" value={order.billingAddress} />
            </div>
          </section>

          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Dispatch</h2>
                <p className="catalog-card__subtitle">Carrier and internal delivery information.</p>
              </div>
            </div>

            <div className="order-contact-card">
              <DetailItem icon={Truck} label="Logistics Partner" value={order.logistics} />
              <DetailItem icon={Package} label="Tracking Reference" value={order.trackingNo} />
              <DetailItem icon={ClipboardList} label="Admin Notes" value={order.notes} />
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                className="catalog-btn"
                style={{ color: '#dc2626', borderColor: '#fecaca' }}
                onClick={handleDelete}
              >
                Delete Order
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetails;
