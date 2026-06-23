import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  PackageCheck,
  ShoppingBag,
  Star,
  Truck,
  Users,
  XCircle,
} from 'lucide-react';
import './AdminDashboard.css';

const numberFormatter = new Intl.NumberFormat('en-IN');
const formatCurrency = (value) => `INR ${numberFormatter.format(value)}`;

const periodOptions = [
  { value: 'may', label: 'May 2026' },
  { value: 'april', label: 'April 2026' },
  { value: 'quarter', label: 'Q2 2026' },
];

const dashboardSnapshots = {
  may: {
    revenue: 379900,
    averageOrder: 27298,
    orders: 578,
    customers: 148,
    dispatchRate: 92,
    revenueTrend: 34.7,
    averageTrend: -12,
    ordersTrend: 27.9,
    customersTrend: 18.2,
    chartLabel: 'May',
    revenueSeries: [
      { name: 'Week 1', value: 62000 },
      { name: 'Week 2', value: 78500 },
      { name: 'Week 3', value: 112000 },
      { name: 'Week 4', value: 127400 },
    ],
    traffic: [
      { name: 'Google', orders: 51, amount: 186200, color: '#2563eb' },
      { name: 'YouTube', orders: 32, amount: 84200, color: '#dc2626' },
      { name: 'Facebook', orders: 24, amount: 58700, color: '#0891b2' },
      { name: 'Direct', orders: 18, amount: 34900, color: '#16a34a' },
      { name: 'Marketplaces', orders: 12, amount: 15900, color: '#f59e0b' },
    ],
  },
  april: {
    revenue: 282000,
    averageOrder: 31020,
    orders: 452,
    customers: 125,
    dispatchRate: 88,
    revenueTrend: 19.4,
    averageTrend: 8.2,
    ordersTrend: 14.8,
    customersTrend: 9.7,
    chartLabel: 'April',
    revenueSeries: [
      { name: 'Week 1', value: 49200 },
      { name: 'Week 2', value: 61200 },
      { name: 'Week 3', value: 78300 },
      { name: 'Week 4', value: 93300 },
    ],
    traffic: [
      { name: 'Google', orders: 43, amount: 139700, color: '#2563eb' },
      { name: 'YouTube', orders: 26, amount: 64900, color: '#dc2626' },
      { name: 'Facebook', orders: 21, amount: 39200, color: '#0891b2' },
      { name: 'Direct', orders: 15, amount: 24200, color: '#16a34a' },
      { name: 'Marketplaces', orders: 9, amount: 14000, color: '#f59e0b' },
    ],
  },
  quarter: {
    revenue: 1057600,
    averageOrder: 29540,
    orders: 1684,
    customers: 416,
    dispatchRate: 90,
    revenueTrend: 24.1,
    averageTrend: 4.5,
    ordersTrend: 21.3,
    customersTrend: 16.8,
    chartLabel: 'Q2',
    revenueSeries: [
      { name: 'Apr', value: 282000 },
      { name: 'May', value: 379900 },
      { name: 'Jun', value: 395700 },
    ],
    traffic: [
      { name: 'Google', orders: 151, amount: 506400, color: '#2563eb' },
      { name: 'YouTube', orders: 86, amount: 218900, color: '#dc2626' },
      { name: 'Facebook', orders: 67, amount: 151100, color: '#0891b2' },
      { name: 'Direct', orders: 49, amount: 105300, color: '#16a34a' },
      { name: 'Marketplaces', orders: 31, amount: 75800, color: '#f59e0b' },
    ],
  },
};

const activePages = [
  { path: '/products/power-tiller-pro', users: 31, conversion: '7.8%' },
  { path: '/categories/irrigation', users: 24, conversion: '5.4%' },
  { path: '/categories/cultivators', users: 18, conversion: '4.9%' },
  { path: '/account/orders', users: 12, conversion: '3.7%' },
  { path: '/cart', users: 10, conversion: '3.2%' },
  { path: '/checkout', users: 8, conversion: '2.6%' },
];

const recentOrders = [
  {
    id: '#AG-1045',
    status: 'Pending',
    customer: 'Giordano Bruno',
    initials: 'GB',
    location: 'Pune, MH',
    date: '2026-05-24',
    total: 27420,
  },
  {
    id: '#AG-1038',
    status: 'On Hold',
    customer: 'Hans Weber',
    initials: 'HW',
    location: 'Indore, MP',
    date: '2026-05-23',
    total: 20400,
  },
  {
    id: '#AG-1029',
    status: 'Pending',
    customer: 'Andrea Rossi',
    initials: 'AR',
    location: 'Nashik, MH',
    date: '2026-05-22',
    total: 50390,
  },
  {
    id: '#AG-1016',
    status: 'Canceled',
    customer: 'Richard Feynman',
    initials: 'RF',
    location: 'Jaipur, RJ',
    date: '2026-05-20',
    total: 7900,
  },
  {
    id: '#AG-1007',
    status: 'Completed',
    customer: 'Leonardo Garcia',
    initials: 'LG',
    location: 'Surat, GJ',
    date: '2026-05-18',
    total: 82600,
  },
  {
    id: '#AG-0998',
    status: 'Completed',
    customer: 'Nikola Tesla',
    initials: 'NT',
    location: 'Nagpur, MH',
    date: '2026-05-17',
    total: 105200,
  },
];

const operations = [
  {
    title: 'Ready to dispatch',
    value: '42',
    detail: 'Orders packed today',
    icon: Truck,
    tone: 'blue',
  },
  {
    title: 'Stock alerts',
    value: '9',
    detail: 'Items below reorder level',
    icon: PackageCheck,
    tone: 'amber',
  },
  {
    title: 'Payment success',
    value: '96%',
    detail: 'Online payments cleared',
    icon: CheckCircle2,
    tone: 'green',
  },
  {
    title: 'Support queue',
    value: '13',
    detail: 'Open customer tickets',
    icon: Activity,
    tone: 'red',
  },
];

const activities = [
  {
    time: '09:40 AM',
    title: 'Inventory updated',
    detail: 'Cultivator blade stock increased by 120 units.',
  },
  {
    time: '11:15 AM',
    title: 'Bulk order received',
    detail: 'New irrigation kit order from Nashik distributor.',
  },
  {
    time: '01:05 PM',
    title: 'Courier pickup',
    detail: 'Twenty four orders moved to ready for dispatch.',
  },
];

const reviews = [
  { product: 'Power Tiller Pro', reviewer: 'Vikram Shah', rating: 5 },
  { product: 'Drip Irrigation Kit', reviewer: 'Meera Patil', rating: 4 },
  { product: 'Cultivator Attachment', reviewer: 'Arun Kumar', rating: 5 },
  { product: 'Steel Garden Cutter', reviewer: 'Neha Joshi', rating: 4 },
];

const buildCsv = (rows) =>
  rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? '');
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

const statusIconMap = {
  Pending: Clock3,
  'On Hold': Clock3,
  Completed: CheckCircle2,
  Canceled: XCircle,
};

const statusClassName = (status) => status.toLowerCase().replace(/\s+/g, '-');

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('may');
  const selectedData = dashboardSnapshots[selectedPeriod];
  const selectedLabel =
    periodOptions.find((period) => period.value === selectedPeriod)?.label || periodOptions[0].label;

  const metricCards = useMemo(
    () => [
      {
        title: 'Total sales',
        value: formatCurrency(selectedData.revenue),
        helper: `Compared with previous ${selectedData.chartLabel.toLowerCase()} period`,
        trend: selectedData.revenueTrend,
        icon: ShoppingBag,
        tone: 'green',
      },
      {
        title: 'Average order',
        value: formatCurrency(selectedData.averageOrder),
        helper: 'Average value per confirmed order',
        trend: selectedData.averageTrend,
        icon: BarChart3,
        tone: 'blue',
      },
      {
        title: 'Total orders',
        value: numberFormatter.format(selectedData.orders),
        helper: `${selectedData.dispatchRate}% dispatch readiness`,
        trend: selectedData.ordersTrend,
        icon: PackageCheck,
        tone: 'amber',
      },
      {
        title: 'Active users',
        value: numberFormatter.format(selectedData.customers),
        helper: 'Live visitors across storefront',
        trend: selectedData.customersTrend,
        icon: Users,
        tone: 'red',
      },
    ],
    [selectedData]
  );

  const trafficTotal = useMemo(
    () => selectedData.traffic.reduce((total, item) => total + item.amount, 0),
    [selectedData]
  );

  const handleExport = () => {
    const rows = [
      ['Section', 'Name', 'Value', 'Detail'],
      ['Period', selectedLabel, '', 'Dashboard export'],
      ...metricCards.map((metric) => [
        'Metric',
        metric.title,
        metric.value,
        `${metric.trend > 0 ? '+' : ''}${metric.trend}%`,
      ]),
      ...selectedData.traffic.map((source) => [
        'Traffic source',
        source.name,
        formatCurrency(source.amount),
        `${source.orders} orders`,
      ]),
      ...recentOrders.map((order) => [
        'Recent order',
        order.id,
        formatCurrency(order.total),
        `${order.status} - ${order.customer}`,
      ]),
      ...activePages.map((page) => ['Active page', page.path, page.users, page.conversion]),
    ];

    const blob = new Blob([buildCsv(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-dashboard-${selectedPeriod}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-heading">
          <span className="dashboard-eyebrow">Admin overview</span>
          <h1>Dashboard</h1>
          <p>Sales, orders, stock movement, and customer activity for Shyam Agro Tools.</p>
        </div>

        <div className="dashboard-controls" aria-label="Dashboard controls">
          <label className="period-control">
            <CalendarDays size={18} aria-hidden="true" />
            <select
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value)}
              aria-label="Select dashboard period"
            >
              {periodOptions.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="export-button" onClick={handleExport}>
            <Download size={18} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </section>

      <section className="operations-grid" aria-label="Operations snapshot">
        {operations.map((item) => {
          const OperationIcon = item.icon;

          return (
            <div className="operation-tile" key={item.title}>
              <div className={`tile-icon tile-icon--${item.tone}`}>
                <OperationIcon size={20} aria-hidden="true" />
              </div>
              <div>
                <span>{item.title}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="metric-grid" aria-label="Performance metrics">
        {metricCards.map((metric) => {
          const MetricIcon = metric.icon;
          const TrendIcon = metric.trend >= 0 ? ArrowUpRight : ArrowDownRight;

          return (
            <article className="metric-card" key={metric.title}>
              <div className="metric-card__top">
                <div className={`metric-icon metric-icon--${metric.tone}`}>
                  <MetricIcon size={22} aria-hidden="true" />
                </div>
                <span className={`trend-pill ${metric.trend >= 0 ? 'trend-pill--up' : 'trend-pill--down'}`}>
                  <TrendIcon size={15} aria-hidden="true" />
                  {Math.abs(metric.trend).toFixed(1)}%
                </span>
              </div>
              <span className="metric-title">{metric.title}</span>
              <strong>{metric.value}</strong>
              <p>{metric.helper}</p>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid dashboard-grid--main">
        <article className="dashboard-panel revenue-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">Income statistics</span>
              <h2>Revenue performance</h2>
            </div>
            <span className="panel-badge">{selectedLabel}</span>
          </div>

          <div className="chart-shell">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedData.revenueSeries} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${numberFormatter.format(value / 1000)}k`}
                  width={44}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                  }}
                />
                <Bar dataKey="value" fill="#2f855a" radius={[6, 6, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel active-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">Live storefront</span>
              <h2>Active users</h2>
            </div>
            <span className="live-indicator">
              <span aria-hidden="true" />
              Live
            </span>
          </div>

          <div className="active-total">
            <Eye size={22} aria-hidden="true" />
            <strong>{numberFormatter.format(selectedData.customers)}</strong>
            <p>Users browsing right now</p>
          </div>

          <div className="table-responsive">
            <table className="dashboard-table compact-table">
              <thead>
                <tr>
                  <th>Active page</th>
                  <th>Users</th>
                  <th>Conv.</th>
                </tr>
              </thead>
              <tbody>
                {activePages.map((page) => (
                  <tr key={page.path}>
                    <td className="path-cell">{page.path}</td>
                    <td>{page.users}</td>
                    <td>{page.conversion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid--traffic">
        <article className="dashboard-panel traffic-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">Channel mix</span>
              <h2>Sales by traffic source</h2>
            </div>
            <span className="panel-badge">{formatCurrency(trafficTotal)}</span>
          </div>

          <div className="traffic-layout">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={selectedData.traffic}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={104}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {selectedData.traffic.map((source) => (
                      <Cell key={source.name} fill={source.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Sales']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span>Total</span>
                <strong>{formatCurrency(trafficTotal)}</strong>
              </div>
            </div>

            <div className="traffic-list">
              {selectedData.traffic.map((source) => {
                const percentage = Math.round((source.amount / trafficTotal) * 100);

                return (
                  <div className="traffic-row" key={source.name}>
                    <div className="traffic-source">
                      <span className="source-dot" style={{ backgroundColor: source.color }} />
                      <div>
                        <strong>{source.name}</strong>
                        <span>{source.orders} orders</span>
                      </div>
                    </div>
                    <div className="traffic-value">
                      <strong>{formatCurrency(source.amount)}</strong>
                      <span>{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        <article className="dashboard-panel timeline-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">Today</span>
              <h2>Recent activity</h2>
            </div>
          </div>

          <div className="activity-list">
            {activities.map((activity) => (
              <div className="activity-item" key={`${activity.time}-${activity.title}`}>
                <span className="activity-time">{activity.time}</span>
                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-panel orders-panel">
        <div className="panel-header">
          <div>
            <span className="section-kicker">Fulfillment</span>
            <h2>Recent orders</h2>
          </div>
          <span className="panel-badge">{recentOrders.length} latest</span>
        </div>

        <div className="table-responsive">
          <table className="dashboard-table orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Date</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const StatusIcon = statusIconMap[order.status] || Clock3;

                return (
                  <tr key={order.id}>
                    <td className="order-id">{order.id}</td>
                    <td>
                      <span className={`status-tag status-tag--${statusClassName(order.status)}`}>
                        <StatusIcon size={14} aria-hidden="true" />
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="avatar-circle">{order.initials}</span>
                        <strong>{order.customer}</strong>
                      </div>
                    </td>
                    <td>{order.location}</td>
                    <td>{order.date}</td>
                    <td className="amount-cell">{formatCurrency(order.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-grid dashboard-grid--bottom">
        <article className="dashboard-panel review-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">Store feedback</span>
              <h2>Recent reviews</h2>
            </div>
          </div>

          <div className="reviews-list">
            {reviews.map((review) => (
              <div className="review-row" key={`${review.product}-${review.reviewer}`}>
                <div>
                  <strong>{review.product}</strong>
                  <span>Reviewed by {review.reviewer}</span>
                </div>
                <div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={15}
                      className={index < review.rating ? 'star-filled' : 'star-muted'}
                      fill={index < review.rating ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel insight-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">Action focus</span>
              <h2>Priority notes</h2>
            </div>
          </div>

          <div className="insight-list">
            <div className="insight-item">
              <span className="insight-marker insight-marker--green" />
              <div>
                <strong>Keep irrigation kits highlighted</strong>
                <p>They are converting above average on both category and product pages.</p>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-marker insight-marker--amber" />
              <div>
                <strong>Restock cultivator accessories</strong>
                <p>Nine SKUs are near reorder level and receiving high traffic.</p>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-marker insight-marker--blue" />
              <div>
                <strong>Follow up pending orders</strong>
                <p>Three large orders are awaiting final confirmation.</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboard;
