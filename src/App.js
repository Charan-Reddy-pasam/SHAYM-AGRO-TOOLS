import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './USER/pages/Home';
import CategoriesPage from './USER/pages/CategoriesPage';
import SingleCategoryPage from './USER/pages/SingleCategoryPage';
import ProductDetailsPage from './USER/pages/ProductDetailsPage';
import CartPage from './USER/pages/CartPage';
import BecomeSeller from './USER/pages/BecomeSeller';
import ContactSupport from './USER/pages/ContactSupport';
import TrackOrder from './USER/pages/TrackOrder';
import CheckoutPage from './USER/pages/CheckoutPage';
import AdminLoginPage from './ADMIN/AdminLoginPage';
import AdminForgotPassword from './ADMIN/AdminForgotPassword';
import AdminVerifyOTP from './ADMIN/AdminVerifyOTP';
import AdminLayout from './ADMIN/AdminLayout';
import AdminDashboard from './ADMIN/dashboard/AdminDashboard';
import Suppliers from './ADMIN/suppliers/SuppliersList';
import Orders from './ADMIN/orders/OrdersList';
import CoinsConverter from './ADMIN/coins/CoinsConverterScreen';
import PaymentHistory from './ADMIN/screens/PaymentHistory';
import Categories from './ADMIN/screens/Categories';
import ProductList from './ADMIN/screens/ProductList';
import DescriptionManager from './ADMIN/screens/DescriptionManager';
import ContactCard from './ADMIN/screens/ContactCard';
import FooterConfig from './ADMIN/screens/FooterConfig';
import Users from './ADMIN/screens/Users';
import { CartProvider } from './USER/context/CartContext';

// New Dropdown Screens Imports
import ProductsList from './ADMIN/catalog/ProductsList';
import ProductsForm from './ADMIN/catalog/ProductsForm';
import ProductFeatures from './ADMIN/catalog/ProductFeatures';
import ProductReviews from './ADMIN/catalog/ProductReviews';
import CategoriesList from './ADMIN/catalog/CategoriesList';
import Category from './ADMIN/catalog/Category';
import CustomersList from './ADMIN/customers/CustomersList';
import Customer from './ADMIN/customers/Customer';
import OrderDetails from './ADMIN/orders/OrderDetails';
import CouponsList from './ADMIN/marketing/CouponsList';
import Coupon from './ADMIN/marketing/Coupon';
import BlogsList from './ADMIN/blogs/BlogsList';
import BlogForm from './ADMIN/blogs/BlogForm';
import TableOfContent from './ADMIN/settings/TableOfContent';
import FormSettings from './ADMIN/settings/FormSettings';
import StaffList from './ADMIN/staff/StaffList';
import AddStaff from './ADMIN/staff/AddStaff';
import SubcategoryForm from './ADMIN/catalog/SubcategoryForm';
import SubcategoriesList from './ADMIN/catalog/SubcategoriesList';
import SuppliersForm from './ADMIN/suppliers/SuppliersForm';
import BrandsList from './ADMIN/brands/BrandsList';
import BrandForm from './ADMIN/brands/BrandForm';
import CRMAppRoutes from './CRM/routes/AppRoutes';
import StockUpdates from './ADMIN/stock/StockUpdates';



function App() {
  // Clean up stale/invalid user session data on app start
  React.useEffect(() => {
    const user = localStorage.getItem('user');

    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        // If the user object doesn't have a token (new API format), clear it
        if (!parsedUser.token) {
          localStorage.removeItem('user');
          console.log("Old mock user data cleared for API testing.");
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    // NOTE: Do NOT clear 'isAdmin' here — admin session must persist across page refreshes.
    // Admin logout is handled explicitly in AdminTopBar.js handleLogout().
  }, []);

  return (
    <Router>
      <CartProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:id" element={<SingleCategoryPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
            <Route path="/contact-support" element={<ContactSupport />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/account" element={<Home />} /> {/* Temporary redirect/view */}
            <Route path="/crm/*" element={<CRMAppRoutes />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/verify-otp" element={<AdminVerifyOTP />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="orders" element={<Orders />} />
              <Route path="coins" element={<CoinsConverter />} />
              <Route path="payments" element={<PaymentHistory />} />
              <Route path="categories" element={<Categories />} />
              <Route path="products" element={<ProductList />} />
              <Route path="descriptions" element={<DescriptionManager />} />
              <Route path="contact-card" element={<ContactCard />} />
              <Route path="footer" element={<FooterConfig />} />
              <Route path="users" element={<Users />} />
              <Route path="staff/list" element={<StaffList />} />
              <Route path="staff/add" element={<AddStaff />} />
              <Route path="suppliers/list" element={<Suppliers />} />
              <Route path="suppliers/add" element={<SuppliersForm />} />
              
              {/* Dropdown Nested Routes */}
              <Route path="catalog/products" element={<ProductsList />} />
              <Route path="catalog/products-form" element={<ProductsForm />} />
              <Route path="catalog/product-features" element={<ProductFeatures />} />
              <Route path="catalog/product-reviews" element={<ProductReviews />} />
              <Route path="catalog/categories" element={<CategoriesList />} />
              <Route path="catalog/subcategories" element={<SubcategoriesList />} />
              <Route path="catalog/category" element={<Category />} />
              <Route path="catalog/subcategory" element={<SubcategoryForm />} />
              <Route path="brands/list" element={<BrandsList />} />
              <Route path="brands/form" element={<BrandForm />} />
              <Route path="customers/list" element={<CustomersList />} />
              <Route path="customers/customer" element={<Customer />} />
              <Route path="orders/list" element={<Orders />} />
              <Route path="orders/details" element={<OrderDetails />} />
              <Route path="orders/details/:orderId" element={<OrderDetails />} />
              <Route path="marketing/coupons" element={<CouponsList />} />
              <Route path="marketing/coupon" element={<Coupon />} />
              <Route path="blogs/list" element={<BlogsList />} />
              <Route path="blogs/form" element={<BlogForm />} />
              <Route path="settings/toc" element={<TableOfContent />} />
              <Route path="settings/form" element={<FormSettings />} />
              <Route path="stock-updates" element={<StockUpdates />} />
            </Route>

          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
