import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown, 
  AlertTriangle, 
  Info, 
  ShoppingBag, 
  User, 
  Settings, 
  LogOut,
  CheckCircle2
} from 'lucide-react';
import './AdminTopBar.css';

const AdminTopBar = () => {
  const navigate = useNavigate();
  
  // Dropdown States
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Read actual admin login details
  const [adminEmail, setAdminEmail] = useState('admin@shyamagro.com');
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const storedEmail = localStorage.getItem('adminEmail');
    const storedName = localStorage.getItem('adminName');
    if (storedEmail) setAdminEmail(storedEmail);
    if (storedName) setAdminName(storedName);
  }, []);
  
  // Notifications State
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'warning', 
      title: 'Low Stock Warning', 
      text: 'Organic seedlings are below safety threshold limit (10 left).', 
      time: '10 mins ago', 
      unread: true 
    },
    { 
      id: 2, 
      type: 'info', 
      title: 'New Supplier registered', 
      text: 'Suresh Agro Tools registered. Verification required.', 
      time: '1 hour ago', 
      unread: true 
    },
    { 
      id: 3, 
      type: 'success', 
      title: 'New Order Placed', 
      text: 'Order #4819 placed by grower Vinay Kumar (Total: INR 8,420).', 
      time: '2 hours ago', 
      unread: true 
    }
  ]);

  // Refs for click outside detection
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotifIcon = (type) => {
    switch(type) {
      case 'warning': return <AlertTriangle size={15} className="text-amber-600" />;
      case 'success': return <ShoppingBag size={15} className="text-emerald-600" />;
      default: return <Info size={15} className="text-blue-600" />;
    }
  };

  return (
    <div className="stroyka-topbar">
      {/* Left: Project Brand */}
      <div className="topbar-left">
        <div className="topbar-brand">
          <img
            src="/logo.png"
            alt="SAT Logo"
            className="topbar-brand-logo"
          />
          <div className="topbar-brand-text">
            <span className="topbar-brand-name">Shyam Agro Tools</span>
            <span className="topbar-brand-sub">Admin Control Panel</span>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        
        {/* Notifications Bell with Dropdown */}
        <div className="topbar-notifications" ref={notifRef}>
          <button 
            className="notification-bell-btn" 
            onClick={() => { 
              setIsNotifOpen(!isNotifOpen); 
              setIsProfileOpen(false); 
            }} 
            title="Notifications"
          >
            <Bell size={18} className="text-gray-700" />
            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
          </button>

          {isNotifOpen && (
            <div className="topbar-dropdown-menu notifications-dropdown">
              <div className="notifications-dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={markAllRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="notifications-dropdown-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                      <div className={`notif-icon-wrap ${notif.type}`}>
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="notif-content">
                        <h4 className="notif-title">{notif.title}</h4>
                        <p className="notif-text">{notif.text}</p>
                        <span className="notif-time">{notif.time}</span>
                      </div>
                      {notif.unread && <span className="unread-dot"></span>}
                    </div>
                  ))
                ) : (
                  <div className="notifications-empty-state">
                    <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
                    <h4>All caught up!</h4>
                    <p>No new notifications at this time.</p>
                  </div>
                )}
              </div>

              <div className="notifications-dropdown-footer">
                {notifications.length > 0 && (
                  <button className="clear-all-btn" onClick={clearNotifications}>
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="topbar-user-profile" ref={profileRef}>
          <div 
            className="user-profile-btn" 
            onClick={() => { 
              setIsProfileOpen(!isProfileOpen); 
              setIsNotifOpen(false); 
            }} 
            title="Profile details"
          >
            <div className="user-avatar-initial">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="user-text">
              <span className="user-name">{adminName}</span>
              <span className="user-email">{adminEmail}</span>
            </div>
            <ChevronDown size={12} className={`chevron-arrow ${isProfileOpen ? 'rotate' : ''} text-gray-500`} />
          </div>

          {isProfileOpen && (
            <div className="topbar-dropdown-menu profile-dropdown">
              <div className="profile-dropdown-header">
                <strong>{adminName}</strong>
                <span>System Administrator</span>
              </div>
              <div className="profile-dropdown-list">
                <button className="profile-dropdown-item" onClick={() => { setIsProfileOpen(false); navigate('/admin/dashboard'); }}>
                  <User size={15} />
                  <span>My Profile</span>
                </button>
                <button className="profile-dropdown-item" onClick={() => { setIsProfileOpen(false); }}>
                  <Settings size={15} />
                  <span>Account Settings</span>
                </button>
                <div className="profile-divider"></div>
                <button className="profile-dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTopBar;
