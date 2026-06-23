import React from 'react';
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
  Truck
} from 'lucide-react';
import {
  adminOrders,
  formatCurrency,
  OrderStatusBadge
} from './OrdersList';
import '../catalog/adminModule.css';

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="order-detail-item">
    <span className="order-detail-item__icon"><Icon size={17} /></span>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);

const OrderDetails = () => {
  const { orderId } = useParams();
  const order = adminOrders.find((item) => item.id === orderId) || adminOrders[0];
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
                  {order.items.map((item) => (
                    <tr key={item.sku}>
                      <td>
                        <div className="catalog-table__title">{item.name}</div>
                        <div className="catalog-table__muted">{item.sku}</div>
                      </td>
                      <td>{item.category}</td>
                      <td className="catalog-center-cell">{item.qty}</td>
                      <td className="catalog-number-cell">{formatCurrency(item.price)}</td>
                      <td className="catalog-number-cell">{formatCurrency(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="catalog-card">
            <div className="catalog-card__header">
              <div>
                <h2>Fulfilment Timeline</h2>
                <p className="catalog-card__subtitle">Operational progress for payment, packing, dispatch, and delivery.</p>
              </div>
            </div>

            <div className="order-timeline">
              {order.timeline.map((event) => (
                <div className={`order-timeline__row ${event.done ? 'is-done' : ''}`} key={event.label}>
                  <span className="order-timeline__dot" />
                  <div>
                    <strong>{event.label}</strong>
                    <span>{event.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
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
          </section>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetails;
