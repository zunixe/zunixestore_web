import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../features/layout/Layout';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import DashboardPage from '../features/dashboard/DashboardPage';
import OrdersPage from '../features/orders/OrdersPage';
import ProductsPage from '../features/products/ProductsPage';
import ProductAddPage from '../features/products/ProductAddPage';
import ProductEditPage from '../features/products/ProductEditPage';
import CustomersPage from '../features/customers/CustomersPage';
import DiscountsPage from '../features/discounts/DiscountsPage';
import ThemePage from '../features/themes/ThemePage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import SettingsPage from '../features/settings/SettingsPage';
import AdminSettingsPage from '../features/settings/AdminSettingsPage';
import ProfilePage from '../features/settings/ProfilePage';
import PaymentsPage from '../features/settings/PaymentsPage';
import ShippingPage from '../features/settings/ShippingPage';
import LocationsPage from '../features/settings/LocationsPage';
import FreeShippingPage from '../features/settings/FreeShippingPage';
import InternationalPage from '../features/settings/InternationalPage';
import StaffPage from '../features/settings/StaffPage';
import DomainPage from '../features/settings/DomainPage';
import StoreAppsPage from '../features/settings/StoreAppsPage';
import PoliciesPage from '../features/settings/PoliciesPage';
import DeleteStorePage from '../features/settings/DeleteStorePage';
import SubscriptionPage from '../features/subscriptions/SubscriptionPage';
import StoreCreatePage from '../features/stores/StoreCreatePage';
import InventoryPage from '../features/inventory/InventoryPage';
import CategoriesPage from '../features/categories/CategoriesPage';
import ProductBundlesPage from '../features/product-bundles/ProductBundlesPage';
import FeaturedProductsPage from '../features/featured-products/FeaturedProductsPage';
import ProductPreferencesPage from '../features/product-preferences/ProductPreferencesPage';
import BalancePage from '../features/balance/BalancePage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products/add" element={<ProductAddPage />} />
          <Route path="/products/edit/:id" element={<ProductEditPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/discounts" element={<DiscountsPage />} />
          <Route path="/themes" element={<ThemePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings/admin" element={<AdminSettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/payments" element={<PaymentsPage />} />
          <Route path="/settings/shipping" element={<ShippingPage />} />
          <Route path="/settings/locations" element={<LocationsPage />} />
          <Route path="/settings/free-shipping" element={<FreeShippingPage />} />
          <Route path="/settings/international" element={<InternationalPage />} />
          <Route path="/settings/staff" element={<StaffPage />} />
          <Route path="/settings/domain" element={<DomainPage />} />
          <Route path="/settings/store-apps" element={<StoreAppsPage />} />
          <Route path="/settings/policies" element={<PoliciesPage />} />
          <Route path="/settings/delete-store" element={<DeleteStorePage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/stores/new" element={<StoreCreatePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/product-bundles" element={<ProductBundlesPage />} />
          <Route path="/featured-products" element={<FeaturedProductsPage />} />
          <Route path="/preferences/products" element={<ProductPreferencesPage />} />
          <Route path="/my-balance" element={<BalancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
