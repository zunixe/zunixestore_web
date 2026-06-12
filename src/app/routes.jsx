import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../features/layout/Layout';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import DashboardPage from '../features/dashboard/DashboardPage';
import OrdersPage from '../features/orders/OrdersPage';
import ProductsPage from '../features/products/ProductsPage';
import CustomersPage from '../features/customers/CustomersPage';
import DiscountsPage from '../features/discounts/DiscountsPage';
import ThemePage from '../features/themes/ThemePage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import SettingsPage from '../features/settings/SettingsPage';
import SubscriptionPage from '../features/subscriptions/SubscriptionPage';
import StoreCreatePage from '../features/stores/StoreCreatePage';

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
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/discounts" element={<DiscountsPage />} />
          <Route path="/themes" element={<ThemePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/stores/new" element={<StoreCreatePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
