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
import PlugoLinksPage from '../features/plugolinks/PlugoLinksPage';
import DealPosPage from '../features/integrations/DealPosPage';
import DestyPage from '../features/omnichannel/DestyPage';
import GineePage from '../features/omnichannel/GineePage';
import GoogleMerchantPage from '../features/google-merchant/GoogleMerchantPage';
import JubelioPage from '../features/omnichannel/JubelioPage';
import FacebookCatalogPage from '../features/facebook-catalog/FacebookCatalogPage';
import MultiLanguagePage from '../features/multi-language/MultiLanguagePage';
import WhatsappLandingPage from '../features/whatsapp-landing/WhatsappLandingPage';
import WalletReportPage from '../features/wallet/WalletReportPage';
import PendingPaymentPage from '../features/orders/PendingPaymentPage';
import PendingShippingPage from '../features/orders/PendingShippingPage';
import OrderPreferencesPage from '../features/orders/OrderPreferencesPage';
import OpenOrderPage from '../features/orders/OpenOrderPage';
import ShipmentPromotionsPage from '../features/discounts/ShipmentPromotionsPage';
import BuyerGroupsPage from '../features/customers/BuyerGroupsPage';
import RatingsPage from '../features/customers/RatingsPage';
import LoyaltyPage from '../features/customers/LoyaltyPage';
import CustomerPreferencesPage from '../features/customers/CustomerPreferencesPage';
import BuyerNotificationsPage from '../features/customers/BuyerNotificationsPage';
import CustomPagesPage from '../features/store-design/CustomPagesPage';
import MediaGalleryPage from '../features/store-design/MediaGalleryPage';
import BlogPage from '../features/store-design/BlogPage';
import FaqPage from '../features/store-design/FaqPage';
import TestimonialsPage from '../features/store-design/TestimonialsPage';
import ReportsPage from '../features/analytics/ReportsPage';
import RealtimePage from '../features/analytics/RealtimePage';
import WishlistReportPage from '../features/analytics/WishlistReportPage';
import LoyaltyAnalyticsPage from '../features/analytics/LoyaltyAnalyticsPage';
import MarketingToolsPage from '../features/analytics/MarketingToolsPage';
import AffiliatePage from '../features/analytics/AffiliatePage';

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
          <Route path="/buyers" element={<CustomersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/product-promotions" element={<DiscountsPage />} />
          <Route path="/discounts" element={<DiscountsPage />} />
          <Route path="/themes" element={<ThemePage />} />
          <Route path="/settings/themes" element={<ThemePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings/admin" element={<AdminSettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/preferences" element={<SettingsPage />} />
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
          <Route path="/wallet/report" element={<WalletReportPage />} />
          <Route path="/links" element={<PlugoLinksPage />} />
          <Route path="/preferences/integrations" element={<DealPosPage />} />
          <Route path="/omnichannel/desty" element={<DestyPage />} />
          <Route path="/omnichannel/ginee" element={<GineePage />} />
          <Route path="/google-merchant-center/setup" element={<GoogleMerchantPage />} />
          <Route path="/omnichannel/jubelio" element={<JubelioPage />} />
          <Route path="/facebook-catalog/setup" element={<FacebookCatalogPage />} />
          <Route path="/apps/localizations/products" element={<MultiLanguagePage />} />
          <Route path="/whatsapp-landing-pages" element={<WhatsappLandingPage />} />

          {/* Pesanan */}
          <Route path="/pending/payment" element={<PendingPaymentPage />} />
          <Route path="/pending/shipping" element={<PendingShippingPage />} />
          <Route path="/preferences/orders" element={<OrderPreferencesPage />} />
          <Route path="/open-order" element={<OpenOrderPage />} />
          {/* Diskon */}
          <Route path="/shipment-promotions" element={<ShipmentPromotionsPage />} />
          {/* Customer */}
          <Route path="/buyer-groups" element={<BuyerGroupsPage />} />
          <Route path="/ratings" element={<RatingsPage />} />
          <Route path="/loyalty" element={<LoyaltyPage />} />
          <Route path="/preferences/checkout" element={<CustomerPreferencesPage />} />
          <Route path="/preferences/buyer-notifications" element={<BuyerNotificationsPage />} />
          {/* Desain Toko */}
          <Route path="/shop/pages" element={<CustomPagesPage />} />
          <Route path="/preferences/asset-manager" element={<MediaGalleryPage />} />
          <Route path="/news" element={<BlogPage />} />
          <Route path="/preferences/faqs" element={<FaqPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          {/* Analitik & Marketing */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/analytics/realtime" element={<RealtimePage />} />
          <Route path="/analytics/wishlist" element={<WishlistReportPage />} />
          <Route path="/loyalty/analytics" element={<LoyaltyAnalyticsPage />} />
          <Route path="/preferences/marketing" element={<MarketingToolsPage />} />
          <Route path="/affiliate-links" element={<AffiliatePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
